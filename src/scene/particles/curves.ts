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

// the tower axis around which the telemetry spirals up like a tornado
const tx = ELEVATOR.pos.x
const tz = ELEVATOR.pos.z
const SPIRAL_TOP = 10.8
const SPIRAL_BASE = 2.6
const R_BASE = 2.9 // wide at the bottom
const R_TOP = 0.6 // converges tight near the top
const TWIST = 0.95 // radians of swirl per world unit of height

const radiusAt = (y: number) =>
  R_BASE + (R_TOP - R_BASE) * Math.min(1, Math.max(0, (y - SPIRAL_BASE) / (SPIRAL_TOP - SPIRAL_BASE)))

// a smooth helix: the sensor stream eases in, then spirals up the tower axis,
// tapering inward — entering the vortex at its own angle + height
function spiral(sensor: THREE.Vector3, angle0: number, yEntry: number) {
  const r0 = radiusAt(yEntry)
  const entry = v(tx + Math.cos(angle0) * r0, yEntry, tz + Math.sin(angle0) * r0)
  const mid = v(
    (sensor.x + entry.x) / 2,
    (sensor.y + entry.y) / 2 + 0.3,
    (sensor.z + entry.z) / 2,
  )
  const pts = [sensor, mid, entry]
  const segs = Math.max(8, Math.round((SPIRAL_TOP - yEntry) * 2.4))
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    const y = yEntry + (SPIRAL_TOP - yEntry) * t
    const ang = angle0 + (y - yEntry) * TWIST
    const r = radiusAt(y)
    pts.push(v(tx + Math.cos(ang) * r, y, tz + Math.sin(ang) * r))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

// every sensor stream feeds the same vortex, entering at a different angle and
// height, then spirals up and converges toward the tight top — a smooth tornado
export const FLOW_CURVES = [
  spiral(WAREHOUSE_FRONT, 0.0, 6.6),
  spiral(WAREHOUSE_BACK, Math.PI * 0.33, 7.2),
  spiral(SILO_SENSORS[0], Math.PI * 0.66, 5.4),
  spiral(SILO_SENSORS[1], Math.PI, 4.6),
  spiral(SILO_SENSORS[2], Math.PI * 1.33, 4.0),
  spiral(GROUND_SENSOR, Math.PI * 1.66, 2.8),
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
