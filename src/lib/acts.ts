import type { MessageDescriptor } from 'react-intl'
import { M } from '../i18n/messages'

/**
 * THE STORY, IN ONE PLACE.
 *
 * The 3D scroll story used to be spelled out five times over — GLSL literals in
 * the particle shader, `data-window` strings in the overlay JSX, camera knots in
 * CameraRig, the `.scroll-track` height in CSS and two hardcoded fade windows in
 * Structures/Network. Every retiming meant editing all five and hoping.
 *
 * ACTS is now the single source of truth. Everything downstream derives from it:
 *   • the shader gets `ACTS_GLSL` injected as #defines (see ParticleEngine) —
 *     string injection, not uniforms, so the driver constant-folds every
 *     smoothstep bound: zero extra ALU on a 110k-vertex shader, zero uniforms.
 *   • the overlay renders one copy block per act and reads its own windows.
 *   • CameraRig samples one pose per act.
 *   • the scroll track height comes from ACTS.length × ACT_VH.
 *
 * Everything here is plain data (no THREE import) so it stays cheap to import
 * from the DOM side of the app.
 */

export type Vec3 = readonly [number, number, number]
export type Align = 'center' | 'left'
export type Shape = 'flow' | 'stream' | 'board' | 'logo'

export type ActCopy = {
  kicker: MessageDescriptor
  title: MessageDescriptor
  body: MessageDescriptor
  align: Align
  /** explicit fade window; defaults to the act's own [at, end) */
  span?: Vec2
}

export type Vec2 = readonly [number, number]

export type CameraPose = { pos: Vec3; target: Vec3 }

export type Act = {
  id: string
  /** story progress (0..1) where this act begins */
  at: number
  label: MessageDescriptor
  copy?: ActCopy
  camera: CameraPose
  cameraMobile?: CameraPose
  shape: Shape
  /** window over which the particle field morphs INTO this act's shape */
  blend?: Vec2
}

export const ACTS: readonly Act[] = [
  {
    id: 'farm',
    at: 0,
    label: M.phase1,
    shape: 'flow',
    camera: { pos: [-1, 6.2, 24], target: [0, 2.8, 0] },
    cameraMobile: { pos: [-3.4, 5.2, 16.5], target: [-7.2, 3.0, -3] },
  },
  {
    id: 'sensors',
    at: 0.16,
    label: M.phase2,
    shape: 'flow',
    copy: {
      kicker: M.sensorsKicker,
      title: M.sensorsTitle,
      body: M.sensorsBody,
      align: 'center',
      span: [0.16, 0.3],
    },
    camera: { pos: [-1.5, 8.0, 5.5], target: [-3.6, 7.0, -2] },
  },
  {
    id: 'stream',
    at: 0.32,
    label: M.phase3,
    shape: 'stream',
    blend: [0.3, 0.42],
    camera: { pos: [-3.6, 3.2, -1.2], target: [-3.6, 10.0, -2] },
  },
  {
    id: 'structured',
    at: 0.5,
    label: M.phase4,
    shape: 'board',
    blend: [0.5, 0.58],
    copy: {
      kicker: M.dataKicker,
      title: M.dataTitle,
      body: M.dataBody,
      align: 'left',
      span: [0.5, 0.6],
    },
    camera: { pos: [0, 3.0, 12.5], target: [0, 1.8, 0] },
  },
  {
    id: 'converge',
    at: 0.62,
    label: M.phase5,
    shape: 'board',
    copy: {
      kicker: M.tagline,
      title: M.convergeTitle,
      body: M.convergeBody,
      align: 'left',
      span: [0.64, 0.85],
    },
    camera: { pos: [0, 5.0, 11.5], target: [0, 4.2, 0] },
  },
  {
    id: 'growcast',
    at: 0.88,
    label: M.phase6,
    shape: 'logo',
    camera: { pos: [0, 6.2, 8.8], target: [0, 5.0, 0] },
  },
]

/**
 * The camera path as it stands today: eleven CatmullRom knots swept as ONE
 * global arclength curve. Stage C1 collapses this to one pose per act (the
 * `camera` fields above) sampled piecewise; until then CameraRig keeps reading
 * these so the refactor is provably a no-op.
 */
export const STORY_KNOTS: {
  positions: readonly Vec3[]
  targets: readonly Vec3[]
  mobilePositions: readonly Vec3[]
  mobileTargets: readonly Vec3[]
} = {
  positions: [
    [-1, 6.2, 24], //   0.000  far, high, wide farm landscape
    [6.5, 5.8, 18], //  0.111  drift right toward the warehouse
    [-1.5, 8.0, 5.5], //0.222  descent toward the (relocated) elevator
    [-3.0, 5.2, 0.8], //into the stream
    [-3.6, 4.2, -1.0], //inside the stream, descending
    [-3.6, 2.2, -1.4], //deeper down inside the vortex (extra dwell)
    [0, 3.0, 12.5], //  pull back to the structured rows
    [0, 3.6, 12], //    0.667  rows settle, the riser begins
    [0, 5.0, 11.5], //  0.778  follow the data rising up the lanes
    [0, 6.2, 10], //    0.889  frame the brand mark forming
    [0, 6.2, 8.8], //   1.000  the brand mark
  ],
  targets: [
    [0, 2.8, 0],
    [1.5, 3.2, 0],
    [-3.6, 7.0, -2], // look at the relocated tower
    [-3.6, 8.5, -2],
    [-3.6, 10.0, -2],
    [-3.6, 11.5, -2], // keep looking up the vortex while descending
    [0, 1.8, 0], // pan back to the data field at origin
    [0, 2.6, 0],
    [0, 4.2, 0],
    [0, 4.9, 0], // tilt down so the brand mark frames above center
    [0, 5.0, 0], // logo sits a bit above the middle, clear of the finale text
  ],
  // mobile (portrait) crops the wide establishing shot, so the opening reframes
  // onto the silo cluster (left of the tower) before the descent
  mobilePositions: [
    [-3.4, 5.2, 16.5],
    [1.5, 5.6, 16],
  ],
  mobileTargets: [
    [-7.2, 3.0, -3],
    [-2.5, 3.2, -1],
  ],
}

// ── derived helpers ────────────────────────────────────────────

/** index of the act containing story progress `p` */
export function actIndexAt(p: number): number {
  let i = 0
  for (let k = 1; k < ACTS.length; k++) if (p >= ACTS[k].at) i = k
  return i
}

/** where act `i` ends (the next act's start, or 1 for the last one) */
export function actEnd(i: number): number {
  return i + 1 < ACTS.length ? ACTS[i + 1].at : 1
}

/** fade window for act `i`'s copy block */
export function copySpan(i: number): Vec2 {
  return ACTS[i].copy?.span ?? [ACTS[i].at, actEnd(i)]
}

/** progress at which the finale (brand lockup + CTA) takes over */
export const FINALE_IN = 0.92

/** viewport-heights of scroll per act — ACTS.length × this is the track height */
export const ACT_VH = 800 / 6

// ── shader constants ───────────────────────────────────────────
// Everything the particle vertex shader needs to know about the timeline.
// Injected as #defines so the numbers are compile-time literals.

const shapeBlend = (shape: Shape): Vec2 => {
  const i = ACTS.findIndex((a) => a.shape === shape)
  if (i < 0) return [1, 1]
  return ACTS[i].blend ?? [ACTS[i].at, ACTS[i].at + 0.1]
}

const STREAM = shapeBlend('stream')
const BOARD = shapeBlend('board')

/** how far the riser's left→right stagger spreads, and how long one trace takes */
export const RISE_STAGGER = 0.08
export const RISE_SPAN = 0.24

const f = (n: number) => n.toFixed(4)

export const ACTS_GLSL = [
  `#define GC_STREAM_IN ${f(STREAM[0])}`,
  `#define GC_STREAM_FULL ${f(STREAM[1])}`,
  `#define GC_BOARD_IN ${f(BOARD[0])}`,
  `#define GC_BOARD_FULL ${f(BOARD[1])}`,
  // the riser leaves the board the moment the board is fully formed
  `#define GC_RISE_AT ${f(BOARD[1])}`,
  `#define GC_RISE_STAGGER ${f(RISE_STAGGER)}`,
  `#define GC_RISE_SPAN ${f(RISE_SPAN)}`,
].join('\n')
