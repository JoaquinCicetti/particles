import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress, and the path deliberately mimics
 * the route the data takes: establish the operation → come in on the Growcast
 * enclosure → square in front of its door → up past it following the conduit →
 * inside the tower looking up the vortex → pull back to the structured rows →
 * up through the circuit lanes → the brand mark.
 *
 * Landscape and portrait share the route and differ only in how close they
 * start — see the knot tables below.
 *
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

/**
 * One route, two opening distances.
 *
 * The path views along the farm's DIAGONAL: the tent sits front-right (x 4.6,
 * z 3.4) and the tower and silos back-left (x -3.6 to -10.2), so a camera out
 * beyond the tent looking back at the tower lines them up in DEPTH rather than
 * across the frame. Looking slightly down, near reads low and far reads high,
 * which stacks both groups up the vertical axis. That was worked out for
 * portrait — where the farm's ~18-unit span simply will not fit across a ~24deg
 * horizontal FOV — but it frames better in landscape too, so both use it.
 *
 * Landscape only starts CLOSER: its horizontal FOV is ~80deg against portrait's
 * ~24, so it fits the same content from roughly 70% of the distance.
 *
 * Only the opening two knots differ. Everything from the swing onto the tower
 * inward is shared, and the last five knots must not move at all — the shader's
 * act boundaries (rows -> riser -> logo) are keyed to the scroll positions they
 * sit at.
 */

// knots 2-5: swing onto the tower, the door, the climb, the vortex
const APPROACH_P = [
  V(-0.6, 2.2, 5.4), //   0.200  swing onto the tower, dropping low
  V(-3.6, 3.05, 2.3), //  0.300  square in front of the enclosure door
  V(-3.6, 6.8, 1.4), //   0.400  rise past it, following the conduit
  V(-3.6, 3.0, -1.7), //  0.500  inside the tower, looking up the vortex
]
const APPROACH_T = [
  V(-3.5, 3.4, -0.9),
  V(-3.6, 3.0, -0.9), // the door plane
  V(-3.6, 10.0, -1.6), // tilt up the conduit as we climb past it
  V(-3.6, 11.5, -2), // keep looking up the vortex while descending
]

// knots 6-10: the rows / riser / logo tail. Fixed — the shader depends on these
const TAIL_P = [
  V(0, 3.0, 12.5), //     0.600  pull back to the structured rows
  V(0, 3.6, 12), //       0.700  rows settle, the riser begins
  V(0, 5.0, 11.5), //     0.800  follow the data rising up the lanes
  V(0, 6.2, 10), //       0.900  frame the brand mark forming
  V(0, 6.2, 8.8), //      1.000  the brand mark
]
const TAIL_T = [
  V(0, 1.8, 0), // pan back to the data field at origin
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 5.7, 0), // tilt up onto the mark as it forms
  V(0, 6.2, 0), // dead centre on the mark — nothing else is in the frame now
]

/**
 * The opening pair. Both aim down the diagonal at the tower from the first
 * frame; they differ only in how far out they sit.
 *
 * Note the path is sampled from cp 0.06, so the frame actually opened on is
 * already 60% of the way from knot 0 to knot 1 — BOTH knots carry the framing.
 * Moving only the first barely shifts the opening; that cost a round earlier.
 */
const OPEN_P = [V(8.4, 12.3, 24.0), V(6.2, 8.7, 16.8)]
const OPEN_T = [V(-3.0, 3.2, -0.8), V(-3.1, 3.2, -0.8)]

const OPEN_MOBILE_P = [V(13.0, 16.0, 34.0), V(10.0, 11.0, 24.0)]
const OPEN_MOBILE_T = [V(-3.0, 3.2, -0.8), V(-3.1, 3.2, -0.8)]

const POSITIONS = [...OPEN_P, ...APPROACH_P, ...TAIL_P]
const TARGETS = [...OPEN_T, ...APPROACH_T, ...TAIL_T]
const MOBILE_POSITIONS = [...OPEN_MOBILE_P, ...APPROACH_P, ...TAIL_P]
const MOBILE_TARGETS = [...OPEN_MOBILE_T, ...APPROACH_T, ...TAIL_T]

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  const { posCurve, tgtCurve } = useMemo(() => {
    const positions = isMobile ? MOBILE_POSITIONS : POSITIONS
    const targets = isMobile ? MOBILE_TARGETS : TARGETS
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
    }
  }, [])

  useFrame(({ camera, pointer, clock }, delta) => {
    // single authority for scroll smoothing — runs even in free-cam mode so
    // the particle choreography still tracks scroll while you orbit
    const k = 1 - Math.exp(-delta * 7)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    // skip the first 6% of the path so it opens a bit closer to the warehouse
    const cp = 0.06 + p * 0.94
    posCurve.getPoint(cp, vPos.current)
    tgtCurve.getPoint(cp, vTgt.current)

    // The pan exists only to clear the hero copy on the left, and that copy is
    // gone by p 0.13 — so it eases out there. It used to hold until 0.30, which
    // dragged the whole approach 1.6 to the left: the look-target ran through
    // the gap between the enclosure and the silo cluster, which is the densest
    // part of the gather, and that is what read as a mess on the way in.
    // Mobile skips it: there the hero copy is anchored to the bottom, so there
    // is nothing on the left to clear, and panning would only push the tent
    // toward the edge of an already narrow frame.
    // No lateral pan any more. It existed to push the old wide farm shot right
    // and clear the hero copy on the left, but the diagonal opening already
    // puts the structures upper-left and the tent lower-right, so panning left
    // only crowds them toward the edge.
    const SCENE_SHIFT = 0
    const pan = SCENE_SHIFT * (1 - THREE.MathUtils.smoothstep(p, 0.03, 0.13))
    vPos.current.x -= pan
    vTgt.current.x -= pan

    // intro reveal: once started, ease a gentle push-in (dolly + slight drop)
    // over ~1.7s so the scene opens with motion instead of a hard cut
    if (started) intro.current = Math.min(1, intro.current + delta / 1.7)
    const introE = THREE.MathUtils.smoothstep(intro.current, 0, 1)
    vPos.current.z += (1 - introE) * 5.5
    vPos.current.y += (1 - introE) * 1.4

    // pointer parallax + idle breathing, tapered to nothing at the finale
    const calm = 1 - THREE.MathUtils.smoothstep(p, 0.88, 1.0)
    parallax.current.x += (pointer.x - parallax.current.x) * Math.min(1, delta * 2.5)
    parallax.current.y += (pointer.y - parallax.current.y) * Math.min(1, delta * 2.5)
    const t = clock.elapsedTime
    vPos.current.x += (parallax.current.x * 0.45 + Math.sin(t * 0.23) * 0.06) * calm
    vPos.current.y += (parallax.current.y * 0.25 + Math.sin(t * 0.31) * 0.04) * calm

    camera.position.copy(vPos.current)
    camera.lookAt(vTgt.current)

    scrollState.focusDist = camera.position.distanceTo(vTgt.current)
  })

  return null
}
