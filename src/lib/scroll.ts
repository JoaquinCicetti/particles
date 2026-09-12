// Shared scroll state. `target` is set by the scroll listener, `smooth` is
// advanced once per frame by CameraRig (single authority), and everything
// else (shaders, DOM overlay) reads `smooth`.
//
// The 3D story is mapped to the `.scroll-track` element only: `target` hits 1
// exactly at the end of the track and stays clamped there while the page keeps
// scrolling into the in-flow solutions content below it.
export const scrollState = {
  target: 0,
  smooth: 0,
  focusDist: 10, // camera→focus distance, used for fake particle DOF
  over: 0, // viewport-fractions scrolled past the end of the story track (0..1)
  page: 0, // whole-document scroll fraction (0..1) — drives the progress rail
  section: null as string | null, // active in-flow section id (set by Solutions)
}

export const SECTION_EVENT = 'gc:section'

export function setSection(id: string | null) {
  if (scrollState.section === id) return
  scrollState.section = id
  window.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail: id }))
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function bindScroll(track: HTMLElement | null) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  const onScroll = () => {
    const vh = window.innerHeight
    const y = window.scrollY
    const storyMax = track ? track.offsetHeight - vh : document.documentElement.scrollHeight - vh
    scrollState.target = storyMax > 0 ? clamp01(y / storyMax) : 0
    scrollState.over = vh > 0 ? clamp01((y - storyMax) / vh) : 0
    const pageMax = document.documentElement.scrollHeight - vh
    scrollState.page = pageMax > 0 ? clamp01(y / pageMax) : 0
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}

// ── eased anchor navigation ────────────────────────────────────
// Native `scroll-behavior: smooth` covers any distance in the same short time,
// so a jump from the hero across the whole story flashed by. This tween scales
// its duration with the distance (clamped) and eases in/out; it bails out the
// moment the user scrolls, so it never fights them.
let tweenRaf = 0
let tweenAbort: (() => void) | null = null

// sine ease-in-out, not cubic. Cubic peaks at 3x the average velocity halfway
// through the tween, which on a long jump whips past everything; sine peaks at
// about half that, so the glide reads as a glide.
const easeInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t))

export function scrollToY(targetY: number) {
  tweenAbort?.()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const maxY = document.documentElement.scrollHeight - window.innerHeight
  const to = Math.max(0, Math.min(maxY, targetY))
  const from = window.scrollY
  const dist = Math.abs(to - from)
  if (dist < 2 || reduce) {
    window.scrollTo({ top: to, behavior: 'instant' })
    return
  }
  // ~0.62s per viewport of travel, between 0.9s and 3.6s. Long jumps get real
  // time to cover the distance instead of being crammed into the old 2.2s cap.
  const duration = Math.min(3600, Math.max(900, (dist / window.innerHeight) * 620))
  const start = performance.now()

  const stop = () => {
    cancelAnimationFrame(tweenRaf)
    for (const ev of INTERRUPT) window.removeEventListener(ev, stop)
    tweenAbort = null
  }
  const INTERRUPT = ['wheel', 'touchstart', 'keydown'] as const
  for (const ev of INTERRUPT) window.addEventListener(ev, stop, { passive: true })
  tweenAbort = stop

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    window.scrollTo({ top: from + (to - from) * easeInOut(t), behavior: 'instant' })
    if (t < 1) tweenRaf = requestAnimationFrame(step)
    else stop()
  }
  tweenRaf = requestAnimationFrame(step)
}

/** Glide to an in-page section (or the top for 'top') and update the hash. */
export function scrollToSection(id: string) {
  const el = id === 'top' ? null : document.getElementById(id)
  const y = el ? el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.04 : 0
  scrollToY(y)
  history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
}
