import * as THREE from 'three'

/**
 * Farm layout + telemetry flow curves.
 *
 * A working farm around a central data hub (the grain elevator at origin):
 *   • GREENHOUSE  — cultivation, on the left
 *   • SILOS       — grain storage, clustered at the back
 *   • MILKING     — dairy parlor, front-right
 * Telemetry "flows" from every zone into the elevator and rises. Curves are
 * baked into a float DataTexture so the particle vertex shader follows them
 * on the GPU (see bakeCurveTexture + sampleCurve in the shader).
 */

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export const ELEVATOR = { width: 1.5, height: 11.5 }

// grain storage — back cluster
export const SILOS = [
  { pos: v(3.0, 0, -6.5), radius: 1.6, height: 5.6 },
  { pos: v(6.2, 0, -6.0), radius: 1.6, height: 5.2 },
  { pos: v(4.7, 0, -3.7), radius: 1.3, height: 4.4 },
]

// cultivation — long gabled structure on the left, long axis along z
export const GREENHOUSE = {
  pos: v(-8, 0, 3),
  len: 8, // z extent
  wid: 3.2, // x extent
  wall: 1.8, // eave height
  ridge: 2.9, // roof peak height
}

// dairy — parlor building + rotary milking carousel, front-right
export const MILKING = {
  pos: v(7.5, 0, 4.6),
  w: 5, // x
  d: 5, // z
  h: 2.2,
  carouselR: 1.7,
}

export const FLOW_CURVES = [
  // greenhouse → elevator → up
  new THREE.CatmullRomCurve3(
    [v(-8, 2.4, 3), v(-4.5, 4.2, 1.6), v(-1.6, 5.4, 0.6), v(0, 6.4, 0), v(0, 10.8, 0)],
    false,
    'centripetal',
  ),
  // milking → elevator → up
  new THREE.CatmullRomCurve3(
    [v(7.5, 2.6, 4.6), v(4, 4.4, 2.4), v(1.4, 5.6, 0.8), v(0, 6.6, 0), v(0, 11, 0)],
    false,
    'centripetal',
  ),
  // silo cluster → elevator → up (two streams)
  new THREE.CatmullRomCurve3(
    [v(3.0, 5.2, -6.5), v(2.0, 6.0, -3.2), v(0.8, 6.4, -1.0), v(0, 6.9, 0), v(0, 10.6, 0)],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [v(6.2, 4.9, -6.0), v(3.6, 6.1, -3.0), v(1.2, 6.4, -0.8), v(0, 7.1, 0), v(0, 10.4, 0)],
    false,
    'centripetal',
  ),
  // ground sensor field → elevator → up
  new THREE.CatmullRomCurve3(
    [v(-9, 0.4, 6.5), v(-4.5, 1.8, 3.4), v(-1.6, 3.2, 1.2), v(0, 5.4, 0), v(0, 10.2, 0)],
    false,
    'centripetal',
  ),
  // inter-zone link: greenhouse → silos
  new THREE.CatmullRomCurve3(
    [v(-8, 2.6, 3), v(-3.5, 2.0, -2), v(0.5, 2.6, -5), v(4.7, 3.0, -3.7)],
    false,
    'centripetal',
  ),
  // high arc: milking → greenhouse
  new THREE.CatmullRomCurve3(
    [v(7.5, 3.2, 4.6), v(2.5, 7.6, 5.2), v(-3, 7.8, 4), v(-8, 3.4, 3)],
    false,
    'centripetal',
  ),
  // perimeter sweep
  new THREE.CatmullRomCurve3(
    [v(-10, 1.2, -6), v(0, 2, -8), v(9, 1.6, -5), v(10.5, 2.4, 2), v(5, 1.4, 8), v(-4, 2.2, 9), v(-10.5, 1.8, 3)],
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

// glowing sensor nodes across the farm — one+ per zone
export const SENSOR_POINTS: THREE.Vector3[] = [
  // silos
  v(3.0, 5.7, -6.5),
  v(6.2, 5.3, -6.0),
  v(4.7, 4.5, -3.7),
  // greenhouse (ridge)
  v(-8, GREENHOUSE.ridge + 0.1, 0),
  v(-8, GREENHOUSE.ridge + 0.1, 6),
  // milking (carousel center + eave)
  v(7.5, 2.4, 4.6),
  v(7.5, 0.9, 4.6),
  // elevator
  v(0, 11.6, 0),
  v(0, 8, 0.05),
  // ground
  v(-9, 0.45, 6.5),
  v(-2, 3, 1.2),
]
