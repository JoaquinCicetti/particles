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
 *   • CameraRig samples one pose per act, piecewise.
 *   • the scroll track height comes from ACTS.length × ACT_VH.
 *
 * The five acts are the client's own canonical narrative:
 *   medimos · conectamos · analizamos · controlamos · registramos
 *
 * Everything here is plain data (no THREE import) so it stays cheap to import
 * from the DOM side of the app.
 */

export type Vec2 = readonly [number, number]
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

export type CameraPose = { pos: Vec3; target: Vec3 }

export type Act = {
  id: string
  /** story progress (0..1) where this act begins */
  at: number
  label: MessageDescriptor
  copy?: ActCopy
  /** the pose the camera SETTLES on at the start of this act */
  camera: CameraPose
  cameraMobile?: CameraPose
  shape: Shape
  /** window over which the particle field morphs INTO this act's shape */
  blend?: Vec2
}

export const ACTS: readonly Act[] = [
  {
    // 0.00 → 0.20 — the establishing shot: the farm, its sensors bubbling up.
    // The hero copy and the metric chips are this act's copy.
    id: 'medimos',
    at: 0,
    label: M.phase1,
    shape: 'flow',
    // the 1.6-unit scene shift that used to be applied every frame (to clear
    // the hero copy on the left) is baked into this pose, and only this one
    camera: { pos: [2.79, 5.82, 20.66], target: [-0.51, 2.97, 0.05] },
    cameraMobile: { pos: [-1.66, 5.37, 16.57], target: [-5.53, 2.81, -1.56] },
  },
  {
    // 0.20 → 0.40 — descend onto the elevator; every sensor's telemetry
    // converges into one rising stream
    id: 'conectamos',
    at: 0.2,
    label: M.phase2,
    shape: 'stream',
    blend: [0.26, 0.38],
    copy: {
      kicker: M.sensorsKicker,
      title: M.sensorsTitle,
      body: M.sensorsBody,
      align: 'center',
      span: [0.15, 0.42],
    },
    camera: { pos: [-2.4, 6.8, 3.0], target: [-3.6, 7.7, -2.0] },
  },
  {
    // 0.40 → 0.60 — out of the vortex and back: the stream sorts itself into
    // the structured field
    id: 'analizamos',
    at: 0.4,
    label: M.phase3,
    shape: 'board',
    blend: [0.48, 0.6],
    copy: {
      kicker: M.dataKicker,
      title: M.dataTitle,
      body: M.dataBody,
      align: 'left',
      span: [0.4, 0.62],
    },
    camera: { pos: [-3.65, 3.5, -1.35], target: [-3.6, 10.6, -2.0] },
  },
  {
    // 0.60 → 0.80 — the traces lift off the board and climb toward the mark
    id: 'controlamos',
    at: 0.6,
    label: M.phase4,
    shape: 'board',
    copy: {
      kicker: M.tagline,
      title: M.convergeTitle,
      body: M.convergeBody,
      align: 'left',
      span: [0.6, 0.86],
    },
    camera: { pos: [0, 3.15, 12.5], target: [0, 1.9, 0] },
  },
  {
    // 0.80 → 1.00 — everything has landed on the brand mark; the finale lockup
    // is this act's copy
    id: 'registramos',
    at: 0.8,
    label: M.phase5,
    shape: 'logo',
    camera: { pos: [0, 5.2, 11.4], target: [0, 4.3, 0] },
  },
]

/** where the camera comes to rest at p = 1 — the brand mark, framed */
export const END_POSE: CameraPose = { pos: [0, 6.2, 8.8], target: [0, 5.0, 0] }

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

/** viewport-heights of scroll per act — ACTS.length × this is the track height */
export const ACT_VH = 120

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
export const RISE_STAGGER = 0.06
export const RISE_SPAN = 0.16
/** the board holds, fully formed, for this long before the first trace lifts */
const BOARD_HOLD = 0.02
/** the leftmost trace leaves the board here; the rightmost lands at FINALE_IN */
export const RISE_AT = BOARD[1] + BOARD_HOLD

/**
 * Progress at which the finale (brand lockup + CTA) takes over: the exact
 * moment the last trace lands on the mark.
 */
export const FINALE_IN = RISE_AT + RISE_STAGGER + RISE_SPAN

/** the built farm fades out as the field morphs into the vortex */
export const FARM_FADE: Vec2 = [STREAM[0] + 0.04, STREAM[1] + 0.06]
/** the faint topology threads go a beat earlier than the structures */
export const NETWORK_FADE: Vec2 = [FARM_FADE[0] - 0.02, FARM_FADE[1] - 0.02]

/** the floating sensor chips belong to act 1 — "medimos" is what they show */
export const METRIC_WINDOW: Vec2 = [0.07, 0.33]

const f = (n: number) => n.toFixed(4)

export const ACTS_GLSL = [
  `#define GC_STREAM_IN ${f(STREAM[0])}`,
  `#define GC_STREAM_FULL ${f(STREAM[1])}`,
  `#define GC_BOARD_IN ${f(BOARD[0])}`,
  `#define GC_BOARD_FULL ${f(BOARD[1])}`,
  `#define GC_RISE_AT ${f(RISE_AT)}`,
  `#define GC_RISE_STAGGER ${f(RISE_STAGGER)}`,
  `#define GC_RISE_SPAN ${f(RISE_SPAN)}`,
].join('\n')
