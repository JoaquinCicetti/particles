import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress, and the path deliberately mimics
 * the route the data takes:
 *   wide farm establishing → drop to ground level and come in looking UP at the
 *   Growcast enclosure → square in front of its door → up past it following the
 *   conduit → inside the tower looking up the vortex → pull back to the
 *   structured rows → up through the circuit lanes → the brand mark.
 *
 * The approach is deliberately low. Coming in at eye level put the silo cluster
 * (x -7.4 / -8.0 / -10.2) directly behind the enclosure (x -3.6) and aimed the
 * camera into the thickest part of the particle gather; from below, everything
 * behind the box is empty sky. Three other approaches were built and compared
 * side by side — see commit bbc6a22 if that ever needs revisiting.
 *
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const POSITIONS = [
  V(-1, 6.2, 24), //      0.000  wide farm landscape
  V(1.0, 2.0, 13.5), //   0.100  already down at ground level, coming in
  V(-1.2, 1.9, 5.0), //   0.200  low and close, looking up at the box
  V(-3.6, 3.05, 1.55), // 0.300  square in front of the enclosure door
  V(-3.6, 6.6, 1.2), //   0.400  rise past it, following the conduit
  V(-3.6, 3.0, -1.7), //  0.500  inside the tower, looking up the vortex
  V(0, 3.0, 12.5), //     0.600  pull back to the structured rows
  V(0, 3.6, 12), //       0.700  rows settle, the riser begins
  V(0, 5.0, 11.5), //     0.800  follow the data rising up the lanes
  V(0, 6.2, 10), //       0.900  frame the brand mark forming
  V(0, 6.2, 8.8), //      1.000  the brand mark
]

const TARGETS = [
  V(0, 2.8, 0),
  V(-2.8, 3.8, -1.0), // the tower, never left of it — the silos must not sit
  V(-3.4, 3.5, -0.9), // behind the subject on the way in
  V(-3.6, 3.0, -0.9), // the door plane
  V(-3.6, 10.0, -1.6), // tilt up the conduit as we climb past it
  V(-3.6, 11.5, -2), // keep looking up the vortex while descending
  V(0, 1.8, 0), // pan back to the data field at origin
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 4.9, 0), // tilt down so the brand mark frames above center
  V(0, 5.0, 0), // logo sits a bit above the middle, clear of the finale text
]

/**
 * Portrait crops the wide establishing shot badly, and what got cut was the
 * warehouse — the biggest structure and the one the copy is about. So mobile
 * opens framed on the tent instead of the whole farm, then swings left toward
 * the tower to hand off to the shared low approach.
 *
 * Two things this framing has to respect. Portrait's horizontal FOV is narrow
 * (~24 deg at 390x844 against 50 vertical), so fitting the tent's 7-unit width
 * needs ~20 units of distance — and since the path is sampled from cp 0.06,
 * the frame you actually open on is already 60% of the way from knot 0 to
 * knot 1, so BOTH have to sit back, not just the first. The targets also aim
 * below the tent, which lifts it above the bottom-anchored hero copy.
 */
const MOBILE_OPEN_P = [V(4.0, 7.5, 27.0), V(3.2, 5.4, 19.0)]
const MOBILE_OPEN_T = [V(4.0, 2.0, 3.0), V(2.6, 2.2, 2.0)]

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  const { posCurve, tgtCurve } = useMemo(() => {
    const positions = isMobile ? [...MOBILE_OPEN_P, ...POSITIONS.slice(2)] : POSITIONS
    const targets = isMobile ? [...MOBILE_OPEN_T, ...TARGETS.slice(2)] : TARGETS
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
    const SCENE_SHIFT = isMobile ? 0 : 1.6
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
