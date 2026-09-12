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
/**
 * Silo instrumentation, the way it actually works: thermometry hangs from the
 * roof down INTO the grain, several probes per cable at different depths, plus
 * one sensor in the head space at the roof vent for the air going out. Nothing
 * is mounted on the skin — a probe on the outside of a bin measures nothing.
 */
const PROBES_PER_CABLE = 2
const CABLES_PER_SILO = 2
/** one entry per cable: where it hangs from, and its probes down the grain */
export const SILO_CABLES = SILOS.flatMap((s, si) =>
  Array.from({ length: CABLES_PER_SILO }, (_, ci) => {
    // stagger the cables across the bin's cross-section so the probes end up
    // distributed through the volume rather than stacked on one axis
    const a = (si * 1.9 + ci * Math.PI) % (Math.PI * 2)
    const rr = s.radius * (ci === 0 ? 0.3 : 0.58)
    const x = s.pos.x + Math.cos(a) * rr
    const z = s.pos.z + Math.sin(a) * rr
    const probes = Array.from({ length: PROBES_PER_CABLE }, (_, k) =>
      // spread down the grain column, none right at the floor or the surface
      v(x, s.height * (0.66 - k * 0.3), z),
    )
    return { top: v(x, s.height * 0.97, z), probes }
  }),
)
/** head-space sensor at each roof vent — the air on its way out */
const SILO_VENTS = SILOS.map((s) => v(s.pos.x, s.height + s.radius * 0.3, s.pos.z))
const WAREHOUSE_FRONT = v(WAREHOUSE.pos.x, WAREHOUSE.ridge + 0.15, WAREHOUSE.pos.z + WAREHOUSE.d / 2)
const WAREHOUSE_BACK = v(WAREHOUSE.pos.x, WAREHOUSE.ridge + 0.15, WAREHOUSE.pos.z - WAREHOUSE.d / 2)
const GROUND_SENSOR = v(-8.5, 0.4, 8.5)

const tx = ELEVATOR.pos.x
const tz = ELEVATOR.pos.z

// glowing sensor nodes — the data sources on every structure
export const SENSOR_POINTS: THREE.Vector3[] = [
  // in-grain thermometry probes, then one head-space sensor per roof vent
  ...SILO_CABLES.flatMap((c) => c.probes),
  ...SILO_VENTS,
  WAREHOUSE_FRONT,
  WAREHOUSE_BACK,
  v(WAREHOUSE.pos.x + WAREHOUSE.w / 2, WAREHOUSE.wall, WAREHOUSE.pos.z + 1.5),
  // the tent carries the bulk of the instrumentation: climate and substrate
  // sensors spread through the grow volume, across the rack rows and up the
  // shelves, rather than a couple of token points
  ...Array.from({ length: 8 }, (_, k) => {
    const col = k % 4
    const tier = Math.floor(k / 4)
    return v(
      WAREHOUSE.pos.x + WAREHOUSE.w * (-0.3 + 0.2 * col),
      WAREHOUSE.wall * (0.32 + 0.4 * tier),
      WAREHOUSE.pos.z + WAREHOUSE.d * (col % 2 === 0 ? -0.24 : 0.2),
    )
  }),
  GROUND_SENSOR,
  v(ELEVATOR.pos.x, ELEVATOR.height + 0.4, ELEVATOR.pos.z),
]


/**
 * The Growcast device: an industrial enclosure bolted to the camera-facing wall
 * of the elevator, with the brand mark on its door. Every structure's telemetry
 * drifts into cable glands underneath it, and a conduit out of its top carries
 * one condensed bundle up the tower and into the sky — the data leaving for the
 * platform. No helix, no swirl: one destination, one uplink.
 */
export const BOARD = {
  w: 1.0, // door width  (x)
  h: 1.15, // door height (y)
  d: 0.3, // how far it stands off the wall (z)
  cy: 3.0, // centre height — low enough to read as wall-mounted kit
  wallZ: tz + ELEVATOR.width / 2, // the tower face it hangs on
}
export const BOARD_TOP = BOARD.cy + BOARD.h / 2
export const SKY = 18.0 // where the uplink hands off to the sky
const SAG = 0.7 // how far the drift dips on its way to the enclosure

// a feed: sensor → slow drift → into the enclosure. These must NOT read as
// wires. Every sensor gets one, so the same particle budget is split many ways
// and no single line carries enough to look like a cable; the path itself is
// only a gentle bow (a hard meander reads as a drawn squiggle), and the real
// look comes from the wide per-particle scatter the shader adds around it,
// which collapses to nothing at the box — so the cloud is visibly absorbed.
const WANDER = 0.7 // world units the path may stray off the straight line
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

// where the drift is taken in, on the underside of the enclosure. Feeds share
// these few points, so many sources resolve to one destination
export const GLANDS = 3
const pad = (i: number) =>
  v(
    tx + BOARD.w * (-0.3 + (0.6 * (i % GLANDS)) / (GLANDS - 1)),
    BOARD.cy - BOARD.h / 2 - 0.04,
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

// one drift per sensor, plus the uplink bundle. Particles are spread evenly
// across curves, so the strand count is the density dial: with a feed for every
// sensor the same budget is divided many more ways and each drift is far
// thinner, while the uplink keeps roughly a third of the flow so it still reads
// as one condensed bundle leaving the box.
const UPLINK_STRANDS = 7
export const FLOW_CURVES = [
  ...SENSOR_POINTS.map((sensor, i) => feed(sensor, pad(i), 1301 + i * 977)),
  ...Array.from({ length: UPLINK_STRANDS }, (_, i) => uplink(i, UPLINK_STRANDS)),
]

/** how many of FLOW_CURVES are sensor drifts — the rest are uplink strands.
 *  the shader needs this to tell them apart: a drift is widest at its sensor
 *  and collapses into the box, the uplink is the opposite. */
export const FEED_COUNT = SENSOR_POINTS.length
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
