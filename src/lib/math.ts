export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// 0→1→0 window over [a, b] with smooth edges (edge = fraction of the window)
export function fadeWindow(p: number, a: number, b: number, edge = 0.2) {
  if (p <= a || p >= b) return 0
  const t = (p - a) / (b - a)
  return smoothstep(0, edge, t) * (1 - smoothstep(1 - edge, 1, t))
}
