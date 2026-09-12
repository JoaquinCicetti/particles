import * as THREE from 'three'

/**
 * ============================================================================
 * TEMPORARY — camera route A/B testing rig. Delete this file, src/ui/
 * CameraSwitch.tsx, its <CameraSwitch/> mount in App.tsx, and the .cam-switch
 * block in global.css once a route is chosen; then inline the winning approach
 * knots back into CameraRig.
 * ============================================================================
 *
 * Only the APPROACH changes between modes — the run from the opening shot to
 * the enclosure door. Everything else is shared and identical:
 *   • the opening position and framing (knot 0)
 *   • the door shot itself (knot 3)
 *   • the turn up to the sky and the vortex entry (knots 4-5)
 *   • the rows / riser / logo tail (knots 6-10), which the shader's act
 *     boundaries are keyed to and must not move
 *
 * What was wrong with the shipped route: the look-target ran through x ≈ -5.2
 * on the way in, which is the gap between the enclosure (x -3.6) and the silo
 * cluster (x -7.4 / -8.0 / -10.2) — i.e. straight into the thickest part of the
 * gather. Two causes, both fixed here: the approach targets themselves sat left
 * of the board, and SCENE_SHIFT (see CameraRig) dragged everything a further
 * 1.6 left for the whole approach. Each route below keeps its look-target on
 * the tower or to the RIGHT of it, never left into the silos.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export type CameraMode = {
  id: string
  label: string
  hint: string
  /** exponential damping on scroll → camera. higher = tracks scroll tighter */
  damp: number
  /** how far ahead of current progress to sample the path (0 = none) */
  lead: number
  positions: THREE.Vector3[]
  targets: THREE.Vector3[]
}

// ── shared, never varies between modes ──────────────────────────────────────
const OPEN_P = V(-1, 6.2, 24) //        the opening shot — kept, it works
const OPEN_T = V(0, 2.8, 0)
const DOOR_P = V(-3.6, 3.05, 1.55) //   square in front of the enclosure door
const DOOR_T = V(-3.6, 3.0, -0.9)
const TAIL_P = [
  V(-3.6, 6.6, 1.2), //   rise past the box, starting to look up
  V(-3.6, 3.0, -1.7), // inside the tower, looking up the vortex
  V(0, 3.0, 12.5), //    pull back to the structured rows
  V(0, 3.6, 12),
  V(0, 5.0, 11.5),
  V(0, 6.2, 10),
  V(0, 6.2, 8.8),
]
const TAIL_T = [
  V(-3.6, 10.0, -1.6),
  V(-3.6, 11.5, -2),
  V(0, 1.8, 0),
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 4.9, 0),
  V(0, 5.0, 0),
]

/** an approach is two knots: they sit between the opening and the door */
type Approach = { p: [THREE.Vector3, THREE.Vector3]; t: [THREE.Vector3, THREE.Vector3] }

const route = (
  id: string,
  label: string,
  hint: string,
  a: Approach,
  damp = 7,
  lead = 0,
): CameraMode => ({
  id,
  label,
  hint,
  damp,
  lead,
  positions: [OPEN_P, ...a.p, DOOR_P, ...TAIL_P],
  targets: [OPEN_T, ...a.t, DOOR_T, ...TAIL_T],
})

export const CAMERA_MODES: CameraMode[] = [
  route('orbit', '1 · Orbit', 'swings out right, arcs in onto the door', {
    // out to the front-right, then curve left onto the door. the look-point
    // stays right of the tower the whole way, so the silos never sit behind it
    p: [V(4.2, 5.0, 13.0), V(0.4, 3.6, 5.2)],
    t: [V(-2.4, 3.9, -1.0), V(-3.2, 3.2, -0.9)],
  }),
  route('low', '2 · Low', 'drops to ground level, looks up at the box — sky behind', {
    // the cheapest way to get a clean backdrop: from below, everything behind
    // the enclosure is empty sky rather than the farm and its gather
    p: [V(1.0, 2.0, 13.5), V(-1.2, 1.9, 5.0)],
    t: [V(-2.8, 3.8, -1.0), V(-3.4, 3.5, -0.9)],
  }),
  route('axis', '3 · Axis', 'dead straight down the front, zero lateral drift', {
    // no sideways movement at all — locked on the tower's own +z axis, target
    // pinned to the board from the first frame of the approach
    p: [V(-3.6, 4.6, 14.0), V(-3.6, 3.5, 6.0)],
    t: [V(-3.6, 3.4, -0.9), V(-3.6, 3.1, -0.9)],
  }),
  route('descend', '4 · Descend', 'comes down from above onto the box — ground behind', {
    // high and dropping, so the backdrop is the ground plane and the data floor
    // rings rather than anything at the board's own height
    p: [V(-0.6, 9.2, 12.0), V(-2.6, 5.6, 5.4)],
    t: [V(-2.9, 4.4, -1.0), V(-3.5, 3.3, -0.9)],
  }),
]

// mobile (portrait) crops the wide establishing shot, so the opening two knots
// are replaced per mode — same reframe the shipped rig used
export const MOBILE_OPEN_P = [V(-2.6, 5.0, 15.5), V(-0.6, 4.2, 9.5)]
export const MOBILE_OPEN_T = [V(-5.0, 3.2, -2), V(-3.2, 3.3, -0.8)]

export const CAMERA_MODE_EVENT = 'gc:cameramode'
const STORAGE_KEY = 'gc_cam_mode'

let active = 0
if (typeof localStorage !== 'undefined') {
  const saved = Number(localStorage.getItem(STORAGE_KEY))
  if (Number.isInteger(saved) && saved >= 0 && saved < CAMERA_MODES.length) active = saved
}

/** read per frame from CameraRig — cheap, no React involved */
export const getCameraModeIndex = () => active

export function setCameraMode(i: number) {
  if (i < 0 || i >= CAMERA_MODES.length || i === active) return
  active = i
  try {
    localStorage.setItem(STORAGE_KEY, String(i))
  } catch {
    // private browsing — the choice just will not persist
  }
  window.dispatchEvent(new CustomEvent(CAMERA_MODE_EVENT, { detail: i }))
}
