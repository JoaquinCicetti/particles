import * as THREE from 'three'
import { createRandom } from '../../lib/random'

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

const tx = ELEVATOR.pos.x
const tz = ELEVATOR.pos.z

/**
 * The Growcast device: an industrial enclosure bolted to the camera-facing wall
 * of the elevator, with the brand mark on its door. Every structure's telemetry
 * drifts into cable glands underneath it, and a conduit out of its top carries
 * one condensed bundle up the tower and into the sky — the data leaving for the
 * platform. No helix, no swirl: one destination, one uplink.
 */
export const BOARD = {
  w: 1.5, // door width  (x)
  h: 1.7, // door height (y)
  d: 0.42, // how far it stands off the wall (z)
  cy: 3.1, // centre height — low enough to read as wall-mounted kit
  wallZ: tz + ELEVATOR.width / 2, // the tower face it hangs on
}
/** the door plane, where the logo sits and the camera comes to look */
export const BOARD_FRONT = v(tx, BOARD.cy, BOARD.wallZ + BOARD.d)
export const BOARD_TOP = BOARD.cy + BOARD.h / 2
export const HUB = BOARD_FRONT
export const SKY = 18.0 // where the uplink hands off to the sky
const SAG = 1.5 // how far each feed cable droops between structure and board

// a feed: sensor → wandering drift → the board's edge. A direct line from each
// sensor reads as a laser pointed at the tower, so the waypoints are scattered
// off the straight path by a seeded wander that is zero at both ends and widest
// in the middle: it leaves the sensor and arrives at the pad, but takes its own
// meandering way there. Centripetal CatmullRom keeps the result smooth.
const WANDER = 3.1 // world units the path may stray off the straight line
function feed(sensor: THREE.Vector3, pad: THREE.Vector3, seed: number) {
  const rnd = createRandom(seed)
  const pts: THREE.Vector3[] = [sensor]
  const segs = 8
  for (let i = 1; i < segs; i++) {
    const t = i / segs
    // envelope: pinned at the sensor and the pad, loosest at mid-span
    const env = Math.sin(Math.PI * t)
    const w = WANDER * env
    pts.push(
      v(
        sensor.x + (pad.x - sensor.x) * t + (rnd() * 2 - 1) * w,
        sensor.y + (pad.y - sensor.y) * t - SAG * env + (rnd() * 2 - 1) * w * 0.5,
        sensor.z + (pad.z - sensor.z) * t + (rnd() * 2 - 1) * w,
      ),
    )
  }
  pts.push(pad)
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

// cable glands along the underside of the enclosure — where real wiring enters,
// and it keeps the door face clear for the logo
export const GLANDS = 4
const pad = (i: number) =>
  v(
    tx + BOARD.w * (-0.34 + (0.68 * i) / (GLANDS - 1)),
    BOARD.cy - BOARD.h / 2 - 0.06,
    BOARD.wallZ + BOARD.d * 0.5,
  )

// the uplink: out of the top of the enclosure, a short bend back to the tower
// axis, then dead straight into the sky. Several near-identical strands so it
// reads as one condensed bundle rather than a single thread.
const UPLINK_R = 0.13
const BEND = 1.1 // height over which the conduit returns to the tower axis
function uplink(strand: number, of: number) {
  const a = (strand / of) * Math.PI * 2
  const ox = Math.cos(a) * UPLINK_R
  const oz = Math.sin(a) * UPLINK_R
  const pts: THREE.Vector3[] = []
  const segs = 18
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const y = BOARD_TOP + (SKY - BOARD_TOP) * t
    // ease off the enclosure's z and onto the tower axis over the first BEND
    const k = Math.min(1, ((y - BOARD_TOP) / BEND) ** 0.8)
    const z = BOARD.wallZ + BOARD.d * 0.5 + (tz - (BOARD.wallZ + BOARD.d * 0.5)) * k
    // emerge as one point, separate into the bundle, open a little at the top
    const spread = Math.min(1, t / 0.05) * (1 + Math.pow(t, 3) * 2.2)
    pts.push(v(tx + ox * spread, y, z + oz * spread))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal')
}

// four wandering feeds — one per structure — and a four-strand uplink.
// particles are spread evenly across curves, so the strand count is also the
// density dial: half the flow rides the uplink, which is what makes it read as
// condensed while the feeds stay thin and drifting.
const UPLINK_STRANDS = 4
export const FLOW_CURVES = [
  feed(WAREHOUSE_FRONT, pad(3), 1301),
  feed(SILO_SENSORS[0], pad(0), 4177),
  feed(SILO_SENSORS[1], pad(1), 9043),
  feed(SILO_SENSORS[2], pad(2), 6211),
  ...Array.from({ length: UPLINK_STRANDS }, (_, i) => uplink(i, UPLINK_STRANDS)),
]

export const CURVE_COUNT = FLOW_CURVES.length
// the feeds wander, so they need enough samples that the meander stays smooth
// rather than reading as a polyline
export const CURVE_SAMPLES = 96

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
