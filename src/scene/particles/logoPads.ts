import * as THREE from 'three'
import type { Silhouette } from './svgSampler'

/**
 * Where the finale's traces land. Every lane is one polyline up from the rows;
 * its last node is a connector, and the connectors sit on the brand mark's own
 * outline — inner lanes come up into its underside, outer lanes climb
 * alongside and turn in horizontally onto its left or right flank — so the
 * traces plug straight into the mark instead of into a package around it.
 *
 * One vec4 per lane, read by the shader:
 *   bottom entry  (padX, padY, highest y the 45 jog may reach, 0)
 *   side entry    (padX, padY, length of the 45 turn,          1)
 */

// routing grid: lanes at k·LANE_STEP across the rows' x −8..8, and the pitch
// of the connectors along the mark's underside
export const LANE_STEP = 0.5
export const LANE_HALF = 16
export const LANE_COUNT = LANE_HALF * 2 + 1
const LANE_EDGE = LANE_HALF * LANE_STEP
const PAD_PITCH = 0.3

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const laneX = (k: number) => (k - LANE_HALF) * LANE_STEP

/** Same rounding as the shader's lane snap. */
export const laneIndex = (x: number) =>
  clamp(Math.floor(x / LANE_STEP + 0.5) + LANE_HALF, 0, LANE_COUNT - 1)

/**
 * Fallback until the mark is rasterized (or if it never is): connectors on the
 * edge of a square package the mark sits inside.
 */
export function squarePads(centerY: number, logoHeight: number) {
  const chipHalf = logoHeight * 0.5 + 0.55
  const bottomX = chipHalf + 1.0
  const chipBottom = centerY - chipHalf
  return Array.from({ length: LANE_COUNT }, (_, k) => {
    const x = laneX(k)
    if (Math.abs(x) <= bottomX) {
      const padX = Math.round((x * (chipHalf - 0.3)) / bottomX / PAD_PITCH) * PAD_PITCH
      return new THREE.Vector4(padX, chipBottom, chipBottom - 0.3 - Math.abs(padX - x), 0)
    }
    const t = (Math.abs(x) - bottomX) / Math.max(LANE_EDGE - bottomX, 0.001)
    const padY = chipBottom + 0.35 + t * (2 * chipHalf - 0.7)
    const turn = Math.min(1.1, (Math.abs(x) - chipHalf) * 0.55)
    return new THREE.Vector4(Math.sign(x) * chipHalf, padY, turn, 1)
  })
}

/** Connectors on the mark's outer silhouette. */
export function logoPads(s: Silhouette) {
  const { scale, W, H, centerY } = s
  const halfW = Math.max(-s.minX, s.maxX)
  const bottomX = halfW + 0.9

  const col = (x: number) => clamp(Math.floor(x / scale + W / 2), 0, W - 1)
  const row = (y: number) => clamp(Math.floor(H / 2 - (y - centerY) / scale), 0, H - 1)

  // lowest point of the underside anywhere over [a, b]
  const lowestOver = (a: number, b: number) => {
    let m = Infinity
    for (let c = col(Math.min(a, b)); c <= col(Math.max(a, b)); c++) {
      if (!Number.isNaN(s.bottom[c])) m = Math.min(m, s.bottom[c])
    }
    return m
  }

  // outermost point of a flank at height y (nearest non-empty row)
  const flankAt = (y: number, side: number) => {
    const edge = side < 0 ? s.left : s.right
    const r = row(y)
    for (let d = 0; d < H; d++) {
      if (r - d >= 0 && !Number.isNaN(edge[r - d])) return edge[r - d]
      if (r + d < H && !Number.isNaN(edge[r + d])) return edge[r + d]
    }
    return side * halfW
  }

  // connector columns along the underside, left to right
  const columns: number[] = []
  for (let j = Math.ceil(s.minX / PAD_PITCH); j * PAD_PITCH <= s.maxX; j++) {
    const x = j * PAD_PITCH
    if (x < s.minX + 0.1 || x > s.maxX - 0.1) continue
    if (!Number.isNaN(s.bottom[col(x)])) columns.push(x)
  }

  const pads = Array.from({ length: LANE_COUNT }, () => new THREE.Vector4())

  // bottom entry: lanes map in order onto the columns, so no two cross
  const under: number[] = []
  for (let k = 0; k < LANE_COUNT; k++) if (Math.abs(laneX(k)) <= bottomX) under.push(k)
  under.forEach((k, i) => {
    const x = laneX(k)
    const f = under.length > 1 ? i / (under.length - 1) : 0.5
    const padX = columns[Math.round(f * (columns.length - 1))]
    const padY = s.bottom[col(padX)]
    const jogTop = lowestOver(x, padX) - 0.3 - Math.abs(padX - x)
    pads[k].set(padX, padY, jogTop, 0)
  })

  // side entry: the outermost lane lands highest, so no two side runs cross
  for (let k = 0; k < LANE_COUNT; k++) {
    const x = laneX(k)
    if (Math.abs(x) <= bottomX) continue
    const side = Math.sign(x)
    const t = (Math.abs(x) - bottomX) / Math.max(LANE_EDGE - bottomX, 0.001)
    const top = s.maxY - 0.35
    let padY = s.minY + 0.35 + t * (top - s.minY - 0.35)
    let padX = flankAt(padY, side)

    // the silhouette isn't convex: a run reaching in under a lobe could cut
    // across a bottom trace rising further out — lift it until it clears
    const crosses = () =>
      under.some((u) => {
        const p = pads[u]
        return side * p.x > side * padX && p.y > padY
      })
    while (crosses() && padY < top) {
      padY += scale * 2
      padX = flankAt(padY, side)
    }
    if (import.meta.env.DEV && crosses()) {
      console.warn(`logoPads: side lane ${x} still crosses a bottom trace`)
    }

    const turn = Math.min(1.1, (Math.abs(x) - halfW) * 0.55)
    pads[k].set(padX, padY, turn, 1)
  }

  return pads
}

/**
 * Re-deal the mark's targets so each lane floods into the part of the mark
 * beside its connector rather than across it. Particles are ranked by the
 * angle of their lane's connector around the mark's centre, targets by their
 * own angle, and paired rank for rank — the set of targets is untouched, so
 * the mark stays evenly dense. Angles start at the underside and run round
 * both flanks, so the seam sits at the top, where no trace lands.
 */
export function fillFromPads(targets: Float32Array, gridX: (i: number) => number, pads: THREE.Vector4[]) {
  const count = targets.length / 3
  let cx = 0
  let cy = 0
  for (let i = 0; i < count; i++) {
    cx += targets[i * 3]
    cy += targets[i * 3 + 1]
  }
  cx /= count
  cy /= count
  const angle = (x: number, y: number) => Math.atan2(x - cx, cy - y)

  const padAngle = pads.map((p) => angle(p.x, p.y))
  const pKey = new Float32Array(count)
  const tKey = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pKey[i] = padAngle[laneIndex(gridX(i))]
    tKey[i] = angle(targets[i * 3], targets[i * 3 + 1])
  }

  const byKey = (key: Float32Array) =>
    Array.from({ length: count }, (_, i) => i).sort((a, b) => key[a] - key[b])
  const particles = byKey(pKey)
  const sorted = byKey(tKey)

  const src = targets.slice()
  for (let r = 0; r < count; r++) {
    const p = particles[r] * 3
    const t = sorted[r] * 3
    targets[p] = src[t]
    targets[p + 1] = src[t + 1]
    targets[p + 2] = src[t + 2]
  }
}
