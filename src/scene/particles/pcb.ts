import * as THREE from 'three'
import { createRandom } from '../../lib/random'

/**
 * Flat 2-D PCB that reads unmistakably as a circuit board. Everything lives on
 * a plane facing the camera (z ≈ 0). Three kinds of "traces" are generated and
 * baked into a float DataTexture (TRACE_SAMPLES × TRACE_COUNT), then particles
 * stream along them as signal pulses before collapsing into the logo:
 *   • routing traces — right-angle (Manhattan) copper runs on a grid
 *   • component outlines — IC/SMD rectangles with pin stubs
 *   • pads — tiny loops that read as bright solder points / vias
 */

export const TRACE_COUNT = 120
export const TRACE_SAMPLES = 64
export const PCB_CENTER_Y = 2.9

const HALF_W = 5.0
const HALF_H = 2.7
const STEP = 0.4
const Z = 0 // flat plane

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const snap = (v: number) => Math.round(v / STEP) * STEP
const gx = (rand: () => number) => snap((rand() * 2 - 1) * HALF_W)
const gy = (rand: () => number) => snap((rand() * 2 - 1) * HALF_H) + PCB_CENTER_Y

// right-angle routing run across the board (x then y then x …)
function routingTrace(random: () => number): THREE.Vector3[] {
  let x = gx(random)
  let y = gy(random)
  const pts = [new THREE.Vector3(x, y, Z)]
  const legs = 3 + Math.floor(random() * 4)
  let horiz = random() < 0.5
  for (let i = 0; i < legs; i++) {
    const d = (random() < 0.5 ? -1 : 1) * snap(0.8 + random() * 2.4)
    if (horiz) x = clamp(x + d, -HALF_W, HALF_W)
    else y = clamp(y + d, PCB_CENTER_Y - HALF_H, PCB_CENTER_Y + HALF_H)
    pts.push(new THREE.Vector3(x, y, Z))
    horiz = !horiz
  }
  return pts
}

// component footprint: rectangle perimeter + a couple of pin stubs
function componentTrace(random: () => number): THREE.Vector3[] {
  const cx = gx(random)
  const cy = gy(random)
  const w = snap(0.8 + random() * 1.6)
  const h = snap(0.6 + random() * 1.2)
  const x0 = clamp(cx - w / 2, -HALF_W, HALF_W)
  const x1 = clamp(cx + w / 2, -HALF_W, HALF_W)
  const y0 = clamp(cy - h / 2, PCB_CENTER_Y - HALF_H, PCB_CENTER_Y + HALF_H)
  const y1 = clamp(cy + h / 2, PCB_CENTER_Y - HALF_H, PCB_CENTER_Y + HALF_H)
  const pts = [
    new THREE.Vector3(x0, y0, Z),
    new THREE.Vector3(x1, y0, Z),
    new THREE.Vector3(x1, y1, Z),
    new THREE.Vector3(x0, y1, Z),
    new THREE.Vector3(x0, y0, Z),
  ]
  return pts
}

// pad / via: a tiny square loop → resamples into a dense bright dot
function padTrace(random: () => number): THREE.Vector3[] {
  const cx = gx(random)
  const cy = gy(random)
  const s = 0.07
  return [
    new THREE.Vector3(cx - s, cy - s, Z),
    new THREE.Vector3(cx + s, cy - s, Z),
    new THREE.Vector3(cx + s, cy + s, Z),
    new THREE.Vector3(cx - s, cy + s, Z),
    new THREE.Vector3(cx - s, cy - s, Z),
  ]
}

function resample(pts: THREE.Vector3[], n: number): THREE.Vector3[] {
  if (pts.length === 1) return new Array(n).fill(0).map(() => pts[0].clone())
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].distanceTo(pts[i - 1])
    seg.push(d)
    total += d
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
  const data = new Float32Array(TRACE_SAMPLES * TRACE_COUNT * 4)
  for (let c = 0; c < TRACE_COUNT; c++) {
    const roll = c / TRACE_COUNT
    const pts =
      roll < 0.62 ? routingTrace(random) : roll < 0.82 ? componentTrace(random) : padTrace(random)
    const rs = resample(pts, TRACE_SAMPLES)
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const p = rs[s]
      const i = (c * TRACE_SAMPLES + s) * 4
      data[i] = p.x
      data[i + 1] = p.y
      data[i + 2] = p.z
      data[i + 3] = 1
    }
  }
  const tex = new THREE.DataTexture(data, TRACE_SAMPLES, TRACE_COUNT, THREE.RGBAFormat, THREE.FloatType)
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}
