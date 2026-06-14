import * as THREE from 'three'

/**
 * Farm layout + telemetry flow curves.
 *
 * A working farm around a central grain-elevator tower (the data hub at the
 * origin):
 *   • WAREHOUSE — the main building (priority), front-left
 *   • SILOS     — grain storage, clustered to the right/back
 * Bright SENSOR_POINTS sit on the structures and are the *sources* of the
 * telemetry: every flow curve begins at a sensor, runs to the tower and
 * rises. Curves are baked into a float DataTexture and followed on the GPU.
 */

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export const ELEVATOR = { width: 1.6, height: 11.5 }

// grain storage — left cluster, mid-distance
export const SILOS = [
  { pos: v(-6.6, 0, -2.4), radius: 1.7, height: 6.0 },
  { pos: v(-8.8, 0, -0.6), radius: 1.5, height: 5.2 },
  { pos: v(-6.9, 0, 1.2), radius: 1.4, height: 4.6 },
]

// the main building (priority) — hydroponic warehouse, gable faces camera,
// placed right-of-centre so the hero copy (bottom-left) never overlaps it
export const WAREHOUSE = {
  pos: v(4.6, 0, 3.4),
  w: 7.0, // x span
  d: 8.0, // z span (gable runs along z)
  wall: 2.9, // eave height
  ridge: 5.0, // roof peak
}

// sensor source points that live ON the structures (and a couple on ground)
const SILO_SENSORS = SILOS.map((s) => v(s.pos.x, s.pos.y + s.height + 0.2, s.pos.z))
const WAREHOUSE_FRONT = v(WAREHOUSE.pos.x, WAREHOUSE.ridge + 0.15, WAREHOUSE.pos.z + WAREHOUSE.d / 2)
const WAREHOUSE_BACK = v(WAREHOUSE.pos.x, WAREHOUSE.ridge + 0.15, WAREHOUSE.pos.z - WAREHOUSE.d / 2)
const GROUND_SENSOR = v(-8.5, 0.4, 8.5)

const HUB = v(0, 6.4, 0)
const RISE_A = v(0, 10.8, 0)
const RISE_B = v(0, 10.4, 0)

// each flow curve starts at a sensor source → tower hub → rises up the shaft
export const FLOW_CURVES = [
  // warehouse (right) → hub
  new THREE.CatmullRomCurve3(
    [WAREHOUSE_FRONT, v(3.0, 5.6, 4.2), v(1.2, 6.2, 1.4), HUB, RISE_A],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [WAREHOUSE_BACK, v(2.6, 5.8, -0.4), v(0.9, 6.4, -0.1), HUB, RISE_B],
    false,
    'centripetal',
  ),
  // silos (left) → hub
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[0], v(-3.4, 6.6, -1.4), v(-1.0, 6.8, -0.4), HUB, RISE_A],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[1], v(-4.6, 6.2, -0.3), v(-1.4, 6.6, -0.1), HUB, RISE_B],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[2], v(-3.6, 5.6, 0.7), v(-1.0, 6.4, 0.2), HUB, RISE_A],
    false,
    'centripetal',
  ),
  // ground / field sensor → hub
  new THREE.CatmullRomCurve3(
    [GROUND_SENSOR, v(-4.5, 1.9, 4.5), v(-1.2, 3.6, 1.2), v(0, 5.4, 0), RISE_B],
    false,
    'centripetal',
  ),
  // faint perimeter sweep (atmosphere)
  new THREE.CatmullRomCurve3(
    [v(-10, 1.2, -6), v(0, 2, -8), v(9, 1.6, -5), v(10.5, 2.4, 2), v(4, 1.4, 9), v(-6, 2.0, 9.5)],
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

// the fraction [0,1] of each curve a particle should respect as its origin —
// sensors are the sources, so most particles start near the curve's head.

// glowing sensor nodes — the data sources on every structure
export const SENSOR_POINTS: THREE.Vector3[] = [
  ...SILO_SENSORS,
  // a second sensor partway up each silo body (side-mounted)
  ...SILOS.map((s) => v(s.pos.x + s.radius, s.pos.y + s.height * 0.55, s.pos.z)),
  WAREHOUSE_FRONT,
  WAREHOUSE_BACK,
  v(WAREHOUSE.pos.x + WAREHOUSE.w / 2, WAREHOUSE.wall, WAREHOUSE.pos.z + 1.5),
  // hydroponic rack sensors inside the warehouse
  v(WAREHOUSE.pos.x - 1.6, WAREHOUSE.wall * 0.7, WAREHOUSE.pos.z),
  v(WAREHOUSE.pos.x + 1.6, WAREHOUSE.wall * 0.5, WAREHOUSE.pos.z - 1.2),
  GROUND_SENSOR,
  v(0, ELEVATOR.height + 0.4, 0),
]
