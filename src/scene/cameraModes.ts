import * as THREE from 'three'

/**
 * ============================================================================
 * TEMPORARY — camera path A/B testing rig. Delete this file, src/ui/
 * CameraSwitch.tsx, its <CameraSwitch/> mount in App.tsx, and the .cam-switch
 * block in global.css once a path is chosen; then inline the winning mode's
 * knots + damp back into CameraRig.
 * ============================================================================
 *
 * Four candidates for the "laggy" feel. Two things can cause it, and the modes
 * separate them:
 *   • DAMP — scrollState.smooth chases the scroll position exponentially, so
 *     the camera always trails the wheel. Low damp = floaty and late.
 *   • LEAD — trailing is only *perceived* as lag when the camera is behind
 *     where you are going. Sampling the path slightly ahead makes it
 *     anticipate instead, which can feel responsive at a low damp.
 * Mode 3 additionally straightens the route, on the theory that the detours
 * (the lateral drift, the rise back over the enclosure) are what feels slow
 * rather than the response curve.
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

// the shipped path — every mode below keeps knots 6..10 identical so the rows,
// riser and logo acts still land exactly where the shader expects them
const BASE_POSITIONS = [
  V(-1, 6.2, 24), //     wide farm landscape
  V(1.2, 5.4, 14.5), //  in from the front
  V(-2.4, 3.8, 5.6), //  closing on the tower wall
  V(-3.6, 3.05, 1.55), //square in front of the enclosure door
  V(-3.6, 6.6, 1.2), //  rise past it, following the conduit
  V(-3.6, 3.0, -1.7), // inside the tower, looking up the vortex
  V(0, 3.0, 12.5), //    pull back to the structured rows
  V(0, 3.6, 12),
  V(0, 5.0, 11.5),
  V(0, 6.2, 10),
  V(0, 6.2, 8.8),
]

const BASE_TARGETS = [
  V(0, 2.8, 0),
  V(-2.4, 3.4, -0.9),
  V(-3.5, 3.05, -0.9),
  V(-3.6, 3.0, -0.9),
  V(-3.6, 10.0, -1.6),
  V(-3.6, 11.5, -2),
  V(0, 1.8, 0),
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 4.9, 0),
  V(0, 5.0, 0),
]

const TAIL_P = BASE_POSITIONS.slice(6)
const TAIL_T = BASE_TARGETS.slice(6)

export const CAMERA_MODES: CameraMode[] = [
  {
    id: 'smooth',
    label: '1 · Smooth',
    hint: 'what ships now — soft damp 3.6, no lead',
    damp: 3.6,
    lead: 0,
    positions: BASE_POSITIONS,
    targets: BASE_TARGETS,
  },
  {
    id: 'snappy',
    label: '2 · Snappy',
    hint: 'same route, damp 11 — camera sticks to the scroll',
    damp: 11,
    lead: 0,
    positions: BASE_POSITIONS,
    targets: BASE_TARGETS,
  },
  {
    id: 'direct',
    label: '3 · Direct',
    hint: 'straight run to the door, no detours, damp 7',
    damp: 7,
    lead: 0,
    positions: [
      V(-2.0, 5.2, 22), //   already facing the tower, no lateral drift
      V(-2.6, 4.5, 12.5), // straight in
      V(-3.2, 3.6, 5.0), //  closing
      V(-3.6, 3.05, 1.55), //the door
      V(-3.6, 5.0, -0.5), // straight up past it, no arc back out
      V(-3.6, 3.0, -1.7), // inside, looking up
      ...TAIL_P,
    ],
    targets: [
      V(-3.2, 3.4, -0.9),
      V(-3.4, 3.2, -0.9),
      V(-3.5, 3.05, -0.9),
      V(-3.6, 3.0, -0.9),
      V(-3.6, 9.0, -1.6),
      V(-3.6, 11.5, -2),
      ...TAIL_T,
    ],
  },
  {
    id: 'lead',
    label: '4 · Lead',
    hint: 'damp 5 but samples ahead — anticipates instead of trailing',
    damp: 5,
    lead: 0.03,
    positions: BASE_POSITIONS,
    targets: BASE_TARGETS,
  },
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
