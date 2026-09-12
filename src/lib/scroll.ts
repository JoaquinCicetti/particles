import { ACTS, ACT_VH } from './acts'

// Shared scroll state. `target` is set by the scroll listener, `smooth` is
// advanced once per animation frame by `advanceScroll` (whichever driver gets
// there first), and everything else (shaders, DOM overlay) reads `smooth`.
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

// ── the one driver ─────────────────────────────────────────────
// The story used to be smoothed inside CameraRig's useFrame, which made
// CameraRig the sole authority: if it ever unmounted, the entire story —
// including the DOM overlay, which only reads `smooth` — silently froze. The
// damping now lives here, driven by our own rAF loop, and CameraRig just calls
// in. The frame guard keeps a double-call (our loop + useFrame in the same
// frame) from advancing twice.

/**
 * Exponential damping rate for `smooth` chasing `target`. Raised from 3.2 when
 * the track went 800vh → 600vh: over a 25% shorter page the old rate lagged far
 * enough that a fast trackpad flick could skip a copy block entirely.
 */
const DAMP = 4.5

let lastAdvance = 0

/**
 * Advance `scrollState.smooth` toward `target`. Idempotent per animation frame:
 * whichever driver reaches it first this frame does the work, the rest no-op.
 */
export function advanceScroll(delta: number) {
  const now = performance.now()
  // frames are ≥4ms apart even at 240Hz; two calls inside one frame land within
  // microseconds of each other
  if (now - lastAdvance < 2) return
  lastAdvance = now
  const k = 1 - Math.exp(-Math.min(0.05, delta) * DAMP)
  scrollState.smooth += (scrollState.target - scrollState.smooth) * k
}

// ── track binding ──────────────────────────────────────────────

let trackEl: HTMLElement | null = null

/** scrollable height of the story track (the range `target` maps across) */
function storyMax() {
  const vh = window.innerHeight
  return trackEl ? trackEl.offsetHeight - vh : document.documentElement.scrollHeight - vh
}

/** document Y for a story progress 0..1 */
export function storyY(p: number) {
  return clamp01(p) * Math.max(0, storyMax())
}

/** glide to a point in the story */
export function scrollToProgress(p: number) {
  scrollToY(storyY(p))
}

export function bindScroll(track: HTMLElement | null) {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  trackEl = track
  // the track length is the story length: ACTS.length × ACT_VH viewport-heights
  document.documentElement.style.setProperty('--story-vh', String(ACTS.length * ACT_VH))

  const onScroll = () => {
    const vh = window.innerHeight
    const y = window.scrollY
    const max = storyMax()
    scrollState.target = max > 0 ? clamp01(y / max) : 0
    scrollState.over = vh > 0 ? clamp01((y - max) / vh) : 0
    const pageMax = document.documentElement.scrollHeight - vh
    scrollState.page = pageMax > 0 ? clamp01(y / pageMax) : 0
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  // fallback driver — keeps the story alive even with no 3D canvas mounted
  let raf = 0
  let last = 0
  const tick = (now: number) => {
    const dt = last ? (now - last) / 1000 : 0
    last = now
    advanceScroll(dt)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    trackEl = null
  }
}

// ── eased anchor navigation ────────────────────────────────────
// Native `scroll-behavior: smooth` covers any distance in the same short time,
// so a jump from the hero across the whole story flashed by. This tween scales
// its duration with the distance (clamped) and eases in/out; it bails out the
// moment the user scrolls, so it never fights them.
let tweenRaf = 0
let tweenAbort: (() => void) | null = null

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const INTERRUPT = ['wheel', 'touchstart', 'keydown'] as const

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
  // ~0.45s per viewport of travel, between 0.7s and 2.2s
  const duration = Math.min(2200, Math.max(700, (dist / window.innerHeight) * 450))
  const start = performance.now()

  let listening = false
  const stop = () => {
    cancelAnimationFrame(tweenRaf)
    if (listening) for (const ev of INTERRUPT) window.removeEventListener(ev, stop)
    listening = false
    tweenAbort = null
  }
  tweenAbort = stop

  const step = (now: number) => {
    // Registering the abort listeners SYNCHRONOUSLY meant a keyboard-triggered
    // tween aborted itself on the very keydown that started it. Bind on the
    // first frame instead, once that event has finished dispatching.
    if (!listening) {
      listening = true
      for (const ev of INTERRUPT) window.addEventListener(ev, stop, { passive: true })
    }
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
