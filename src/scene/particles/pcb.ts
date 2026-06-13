import * as THREE from 'three'
import { createRandom } from '../../lib/random'

/**
 * Procedural volumetric PCB. Each "trace" is a right-angle (Manhattan) route
 * through a 3-D volume across a few z-layers, with occasional vias (z hops).
 * Traces are baked into a float DataTexture (TRACE_SAMPLES × TRACE_COUNT) the
 * same way as the flow curves, so particles can stream along them on the GPU
 * as live signal pulses, then collapse into the logo.
 */

export const TRACE_COUNT = 96
export const TRACE_SAMPLES = 64
export const PCB_CENTER_Y = 2.9

const HALF_W = 5.4 // x ∈ [-5.4, 5.4]
const HALF_H = 2.9 // y ∈ center ± 2.9
const LAYERS = [-2, -0.7, 0.7, 2] // z planes
const STEP = 0.45 // routing grid

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const snap = (v: number) => Math.round(v / STEP) * STEP

// build one right-angle polyline (array of corner points)
function makeTrace(random: () => number): THREE.Vector3[] {
  let li = Math.floor(random() * LAYERS.length)
  let z = LAYERS[li]
  let x = snap((random() * 2 - 1) * HALF_W)
  let y = snap((random() * 2 - 1) * HALF_H) + PCB_CENTER_Y
  const pts = [new THREE.Vector3(x, y, z)]

  const segs = 4 + Math.floor(random() * 5) // 4–8 legs
  for (let s = 0; s < segs; s++) {
    const roll = random()
    if (roll < 0.16) {
      // via: hop to an adjacent layer
      const dir = random() < 0.5 ? -1 : 1
      const nl = clamp(li + dir, 0, LAYERS.length - 1)
      if (nl !== li) {
        li = nl
        z = LAYERS[li]
      }
    } else if (roll < 0.58) {
      x = clamp(x + (random() < 0.5 ? -1 : 1) * snap(0.9 + random() * 2.6), -HALF_W, HALF_W)
    } else {
      y = clamp(
        y + (random() < 0.5 ? -1 : 1) * snap(0.9 + random() * 2.2),
        PCB_CENTER_Y - HALF_H,
        PCB_CENTER_Y + HALF_H,
      )
    }
    pts.push(new THREE.Vector3(x, y, z))
  }
  return pts
}

// resample a polyline to N points evenly by arc length (uniform flow speed)
function resample(pts: THREE.Vector3[], n: number): THREE.Vector3[] {
  if (pts.length === 1) return new Array(n).fill(0).map(() => pts[0].clone())
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const d = pts[i].distanceTo(pts[i - 1])
    seg.push(d)
    total += d
  }
  const out: THREE.Vector3[] = []
  for (let k = 0; k < n; k++) {
    let target = (total * k) / (n - 1)
    let i = 0
    while (i < seg.length && target > seg[i]) {
      target -= seg[i]
      i++
    }
    if (i >= seg.length) {
      out.push(pts[pts.length - 1].clone())
    } else {
      const t = seg[i] > 1e-6 ? target / seg[i] : 0
      out.push(pts[i].clone().lerp(pts[i + 1], t))
    }
  }
  return out
}

export function bakePcbTexture() {
  const random = createRandom(778899)
  const data = new Float32Array(TRACE_SAMPLES * TRACE_COUNT * 4)
  for (let c = 0; c < TRACE_COUNT; c++) {
    const pts = resample(makeTrace(random), TRACE_SAMPLES)
    for (let s = 0; s < TRACE_SAMPLES; s++) {
      const p = pts[s]
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
