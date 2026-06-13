import * as THREE from 'three'

/**
 * Site layout + telemetry flow curves.
 *
 * Three holographic silos surround a central grain elevator at the origin.
 * Curves describe how telemetry/grain "flows": silo → elevator shaft → up,
 * silo ↔ silo links, ground sensors feeding in, and a perimeter sweep.
 * Curves are baked into a float DataTexture so the particle vertex shader
 * can follow them on the GPU.
 */

export const SILOS = [
  { pos: new THREE.Vector3(-7, 0, -2), radius: 1.7, height: 5.6 },
  { pos: new THREE.Vector3(6.8, 0, -3.2), radius: 1.7, height: 5.8 },
  { pos: new THREE.Vector3(4.2, 0, 4.6), radius: 1.5, height: 4.8 },
]

export const ELEVATOR = { width: 1.5, height: 11.5 }

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export const FLOW_CURVES = [
  // silo A → elevator → up the shaft
  new THREE.CatmullRomCurve3(
    [v(-7, 4.8, -2), v(-4.5, 6.2, -1.2), v(-1.8, 5.4, -0.6), v(0, 6.5, 0), v(0, 10.8, 0)],
    false,
    'centripetal',
  ),
  // silo B → elevator → up
  new THREE.CatmullRomCurve3(
    [v(6.8, 5, -3.2), v(4, 6.4, -2), v(1.5, 5.6, -0.8), v(0, 7.2, 0), v(0, 11, 0)],
    false,
    'centripetal',
  ),
  // silo C → elevator → up
  new THREE.CatmullRomCurve3(
    [v(4.2, 4.2, 4.6), v(2.6, 5.8, 2.8), v(0.8, 5, 1.2), v(0, 6.8, 0), v(0, 10.6, 0)],
    false,
    'centripetal',
  ),
  // ground sensor field → elevator → up
  new THREE.CatmullRomCurve3(
    [v(-8.5, 0.4, 5), v(-5, 1.6, 3.4), v(-2, 3, 1.4), v(0, 5.5, 0), v(0, 10.2, 0)],
    false,
    'centripetal',
  ),
  // inter-silo links
  new THREE.CatmullRomCurve3(
    [v(-7, 3.4, -2), v(-2, 2.2, -4.4), v(3, 3, -4.2), v(6.8, 3.6, -3.2)],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [v(6.8, 2.8, -3.2), v(6.6, 3.6, 0.8), v(5.4, 2.6, 3), v(4.2, 3.2, 4.6)],
    false,
    'centripetal',
  ),
  // high arc C → A
  new THREE.CatmullRomCurve3(
    [v(4.2, 4.6, 4.6), v(1.5, 7.5, 3.4), v(-2.5, 8, 1.8), v(-7, 5, -2)],
    false,
    'centripetal',
  ),
  // perimeter sweep
  new THREE.CatmullRomCurve3(
    [v(-9, 1.2, -6), v(0, 2, -7.5), v(8, 1.6, -5.5), v(9.5, 2.4, 1.5), v(5, 1.4, 7), v(-3, 2.2, 8), v(-9.5, 1.8, 2)],
    false,
    'centripetal',
  ),
]

export const CURVE_COUNT = FLOW_CURVES.length
export const CURVE_SAMPLES = 64

export function bakeCurveTexture() {
  const data = new Float32Array(CURVE_SAMPLES * CURVE_COUNT * 4)
  const p = new THREE.Vector3()
  for (let c = 0; c < CURVE_COUNT; c++) {
    for (let s = 0; s < CURVE_SAMPLES; s++) {
      FLOW_CURVES[c].getPoint(s / (CURVE_SAMPLES - 1), p)
      const i = (c * CURVE_SAMPLES + s) * 4
      data[i] = p.x
      data[i + 1] = p.y
      data[i + 2] = p.z
      data[i + 3] = 1
    }
  }
  const tex = new THREE.DataTexture(data, CURVE_SAMPLES, CURVE_COUNT, THREE.RGBAFormat, THREE.FloatType)
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

// glowing sensor nodes scattered across the site
export const SENSOR_POINTS: THREE.Vector3[] = [
  v(-7, 5.1, -2),
  v(6.8, 5.3, -3.2),
  v(4.2, 4.4, 4.6),
  v(0, 11.6, 0),
  v(0, 8, 0.05),
  v(-8.5, 0.45, 5),
  v(9.5, 2.4, 1.5),
  v(-9, 1.2, -6),
  v(-2, 3, 1.4),
]
