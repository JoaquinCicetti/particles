import * as THREE from 'three'
import { createRandom } from '../../lib/random'

/**
 * Flat 2-D PCB that reads as real copper routing (not component boxes).
 * Everything lives on a plane facing the camera (z ≈ 0). Traces are
 * predominantly long horizontal "bus" runs that branch at right angles and
 * fan out to pads/vias — so as particles stream along them they read as the
 * "structured data → ordered lines → PCB paths" the brief asks for, before
 * morphing into the logo. Baked into a DataTexture (TRACE_SAMPLES × TRACE_COUNT).
 */

export const TRACE_COUNT = 132
export const TRACE_SAMPLES = 64
export const PCB_CENTER_Y = 2.9

const HALF_W = 5.6
const HALF_H = 2.7
const STEP = 0.3

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const snap = (v: number) => Math.round(v / STEP) * STEP
const rowY = (k: number, rows: number) =>
  PCB_CENTER_Y - HALF_H + (2 * HALF_H * (k + 0.5)) / rows

// a long copper run: enters on one edge, travels the board on a bus row,
// then right-angle branches to a pad on another row — classic PCB routing
function routingTrace(random: () => number, rows: number): THREE.Vector3[] {
  const startRow = Math.floor(random() * rows)
  const fromLeft = random() < 0.5
  const x0 = fromLeft ? -HALF_W : HALF_W
  const y0 = rowY(startRow, rows)
  const pts: THREE.Vector3[] = [new THREE.Vector3(x0, y0, 0)]

  // travel along the bus row to a branch point
  const bx = snap((random() * 2 - 1) * HALF_W * 0.8)
  pts.push(new THREE.Vector3(bx, y0, 0))

  // right-angle to a target row, then a short run to the pad
  const targetRow = clamp(startRow + Math.floor((random() - 0.5) * rows), 0, rows - 1)
  const y1 = rowY(targetRow, rows)
  pts.push(new THREE.Vector3(bx, y1, 0))
  const padX = clamp(bx + (random() < 0.5 ? -1 : 1) * snap(0.6 + random() * 2.2), -HALF_W, HALF_W)
  pts.push(new THREE.Vector3(padX, y1, 0))

  // optional second dog-leg for denser, more believable routing
  if (random() < 0.5) {
    const y2 = rowY(clamp(targetRow + (random() < 0.5 ? -1 : 1), 0, rows - 1), rows)
    pts.push(new THREE.Vector3(padX, y2, 0))
    pts.push(new THREE.Vector3(clamp(padX + snap(0.5 + random()), -HALF_W, HALF_W), y2, 0))
  }
  return pts
}

// a tight cluster of parallel traces (a data bus) on adjacent rows
function busTrace(random: () => number, rows: number): THREE.Vector3[] {
  const r = Math.floor(random() * rows)
  const y = rowY(r, rows)
  const xa = snap(-HALF_W + random() * HALF_W)
  const xb = clamp(xa + snap(2.5 + random() * 5), -HALF_W, HALF_W)
  return [new THREE.Vector3(xa, y, 0), new THREE.Vector3(xb, y, 0)]
}

// pad / via — a tiny loop that resamples into a dense bright dot
function padTrace(random: () => number): THREE.Vector3[] {
  const cx = snap((random() * 2 - 1) * HALF_W)
  const cy = snap((random() * 2 - 1) * HALF_H) + PCB_CENTER_Y
  const s = 0.06
  return [
    new THREE.Vector3(cx - s, cy - s, 0),
    new THREE.Vector3(cx + s, cy - s, 0),
    new THREE.Vector3(cx + s, cy + s, 0),
    new THREE.Vector3(cx - s, cy + s, 0),
    new THREE.Vector3(cx - s, cy - s, 0),
  ]
}

function resample(pts: THREE.Vector3[], n: number): THREE.Vector3[] {
  if (pts.length === 1) return new Array(n).fill(0).map(() => pts[0].clone())
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const dd = pts[i].distanceTo(pts[i - 1])
    seg.push(dd)
    total += dd
  }
  if (total < 1e-5) return new Array(n).fill(0).map(() => pts[0].clone())
  const out: THREE.Vector3[] = []
  for (let k = 0; k < n; k++) {
    let target = (total * k) / (n - 1)
    let i = 0
    while (i < seg.length && target > seg[i]) {
      target -= seg[i]
      i++
    }
    if (i >= seg.length) out.push(pts[pts.length - 1].clone())
    else out.push(pts[i].clone().lerp(pts[i + 1], seg[i] > 1e-6 ? target / seg[i] : 0))
  }
  return out
}

export function bakePcbTexture() {
  const random = createRandom(778899)
  const rows = 13
  const data = new Float32Array(TRACE_SAMPLES * TRACE_COUNT * 4)
  const centroidX = new Float32Array(TRACE_COUNT)
  for (let c = 0; c < TRACE_COUNT; c++) {
    const roll = c / TRACE_COUNT
    const pts =
      roll < 0.6 ? routingTrace(random, rows) : roll < 0.82 ? busTrace(random, rows) : padTrace(random)
    const rs = resample(pts, TRACE_SAMPLES)
    let sx = 0
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const p = rs[s]
      const i = (c * TRACE_SAMPLES + s) * 4
      data[i] = p.x
      data[i + 1] = p.y
      data[i + 2] = p.z
      data[i + 3] = 1
      sx += p.x
    }
    centroidX[c] = sx / TRACE_SAMPLES
  }
  const tex = new THREE.DataTexture(data, TRACE_SAMPLES, TRACE_COUNT, THREE.RGBAFormat, THREE.FloatType)
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true

  // reveal order 0..1 by horizontal position → PCB draws in left→right
  const order = new Float32Array(TRACE_COUNT)
  for (let c = 0; c < TRACE_COUNT; c++) order[c] = (centroidX[c] + HALF_W) / (2 * HALF_W)

  return { tex, order }
}
