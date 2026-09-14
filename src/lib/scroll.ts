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

/** The URL with no fragment, for clearing the hash without a reload. */
const bareUrl = () => location.pathname + location.search

export function setSection(id: string | null) {
  if (scrollState.section === id) return
  scrollState.section = id
  // The hash follows the section you are actually looking at, INCLUDING back
  // to nothing: scrolling up out of the solutions used to leave a stale
  // #cultivo in the bar forever.
  history.replaceState(null, '', id ? `#${id}` : bareUrl())
  window.dispatchEvent(new CustomEvent(SECTION_EVENT, { detail: id }))
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/**
 * Set by a section jump. The scroll event it causes snaps `smooth` straight
 * onto the new target — otherwise CameraRig would still ease across the whole
 * distance and replay the story behind the jump.
 */
let snapNext = false

/** Gestures that mean the reader has taken over. */
const GESTURE = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

export function bindScroll(track: HTMLElement | null) {
  history.scrollRestoration = 'manual'
  // Drop any incoming fragment before the browser can act on it. The story is
  // built to start at the top — the loader, the camera rig and the particle
  // windows all assume scroll 0 — so a reload after clicking an anchor must
  // not land mid-story. setSection re-adds the hash as you travel.
  const hadHash = !!location.hash
  if (hadHash) history.replaceState(null, '', bareUrl())
  window.scrollTo(0, 0)

  // Clearing the hash is not enough on a cold load: the browser schedules its
  // own fragment scroll, and this page keeps growing underneath it as the lazy
  // solutions mount, so that scroll can land well after ours. Hold the top
  // until the reader actually moves, or a beat passes.
  let pinned = hadHash
  const release = () => {
    pinned = false
    for (const ev of GESTURE) window.removeEventListener(ev, release)
  }
  if (pinned) {
    for (const ev of GESTURE) window.addEventListener(ev, release, { passive: true })
    setTimeout(release, 1600)
  }

  const onScroll = () => {
    if (pinned && window.scrollY > 0) window.scrollTo(0, 0)
    const vh = window.innerHeight
    const y = window.scrollY
    const storyMax = track ? track.offsetHeight - vh : document.documentElement.scrollHeight - vh
    scrollState.target = storyMax > 0 ? clamp01(y / storyMax) : 0
    if (snapNext) {
      snapNext = false
      scrollState.smooth = scrollState.target
    }
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

// ── anchor navigation ──────────────────────────────────────────
/**
 * Document y of an element's layout box. Summed offsets rather than
 * getBoundingClientRect, so a section still sitting on its 28px reveal
 * offset (see `.sol`) does not skew where the jump lands.
 */
const docTop = (el: HTMLElement) => {
  let y = 0
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop
  return y
}

/** Jump straight to an in-page section (or the top for 'top') and update the hash. */
export function scrollToSection(id: string) {
  const el = id === 'top' ? null : document.getElementById(id)
  const maxY = document.documentElement.scrollHeight - window.innerHeight
  const y = Math.max(0, Math.min(maxY, el ? docTop(el) - window.innerHeight * 0.04 : 0))
  if (Math.abs(y - window.scrollY) >= 1) {
    snapNext = true
    window.scrollTo({ top: y, behavior: 'instant' })
  }
  history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`)
}
