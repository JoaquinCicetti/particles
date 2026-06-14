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

// the grain-elevator tower — moved in close to the silo cluster
export const ELEVATOR = { pos: v(-3.6, 0, -2), width: 1.6, height: 11.5 }

// grain storage — left cluster, spread + set back from the hero copy
export const SILOS = [
  { pos: v(-7.4, 0, -4.2), radius: 1.7, height: 6.0 },
  { pos: v(-10.2, 0, -2.2), radius: 1.5, height: 5.2 },
  { pos: v(-8.0, 0, -0.2), radius: 1.4, height: 4.6 },
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

// a point on the tower's vertical data column (slight x/z variation so the
// column reads with width, not as a single line)
const tx = ELEVATOR.pos.x
const tz = ELEVATOR.pos.z
const shaft = (y: number, dx = 0, dz = 0) => v(tx + dx, y, tz + dz)

// each flow curve starts at a sensor source and JOINS the central rising
// column at its own height (joinY differs per sensor), then climbs to the
// top — so streams merge into the column in different places, not one point.
export const FLOW_CURVES = [
  // warehouse front → joins high
  new THREE.CatmullRomCurve3(
    [WAREHOUSE_FRONT, v(1.2, 6.2, 3.0), v(-1.8, 6.7, 0.0), shaft(6.8, 0.3, 0.2), shaft(10.4, -0.2, -0.2)],
    false,
    'centripetal',
  ),
  // warehouse back → joins highest
  new THREE.CatmullRomCurve3(
    [WAREHOUSE_BACK, v(0.8, 6.6, -1.2), v(-2.2, 7.2, -1.8), shaft(7.4, -0.3, 0.0), shaft(11.0, 0.2, -0.2)],
    false,
    'centripetal',
  ),
  // silos (left) → each joins at a different mid height
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[0], v(-5.6, 6.0, -3.2), shaft(5.6, -0.2, -0.3), shaft(10.6, 0.1, 0.1)],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[1], v(-7.0, 5.2, -2.1), shaft(4.8, 0.3, -0.1), shaft(10.2, -0.2, 0.2)],
    false,
    'centripetal',
  ),
  new THREE.CatmullRomCurve3(
    [SILO_SENSORS[2], v(-5.8, 4.6, -1.0), shaft(4.2, -0.1, 0.3), shaft(10.8, 0.2, -0.1)],
    false,
    'centripetal',
  ),
  // ground / field sensor → joins lowest
  new THREE.CatmullRomCurve3(
    [GROUND_SENSOR, v(-6.0, 1.6, 4.0), v(-4.6, 2.8, 0.4), shaft(3.4, 0.2, 0.2), shaft(9.8, -0.1, -0.2)],
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
  v(ELEVATOR.pos.x, ELEVATOR.height + 0.4, ELEVATOR.pos.z),
]
