// Shared scroll state. `target` is set by the scroll listener, `smooth` is
// advanced once per frame by CameraRig (single authority), and everything
// else (shaders, DOM overlay) reads `smooth`.
export const scrollState = {
  target: 0,
  smooth: 0,
  focusDist: 10, // camera→focus distance, used for fake particle DOF
}

export function bindScroll() {
  history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollState.target = max > 0 ? window.scrollY / max : 0
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
