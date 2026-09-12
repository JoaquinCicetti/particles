import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress, and the path deliberately mimics
 * the route the data takes:
 *   wide farm establishing → in from the front onto the Growcast enclosure →
 *   square in front of its door, on the brand mark → up past it following the
 *   conduit → inside the tower looking up the vortex → pull back to the
 *   structured rows → up through the circuit lanes → the brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const POSITIONS = [
  V(-1, 6.2, 24), //   0.000  far, high, wide farm landscape
  V(1.2, 5.4, 14.5), //0.111  in from the front, the enclosure becomes the subject
  V(-2.4, 3.8, 5.6), //0.222  closing on the tower wall
  V(-3.6, 3.05, 1.55), //0.333 square in front of the door — the brand mark
  V(-3.6, 6.6, 1.2), //0.444  rise past it, following the conduit up
  V(-3.6, 3.0, -1.7), //0.500 inside the tower, looking up the vortex
  V(0, 3.0, 12.5), //  pull back to the structured rows
  V(0, 3.6, 12), //    0.667  rows settle, the riser begins
  V(0, 5.0, 11.5), //  0.778  follow the data rising up the lanes
  V(0, 6.2, 10), //    0.889  frame the brand mark forming
  V(0, 6.2, 8.8), //   1.000  the brand mark
]

const TARGETS = [
  V(0, 2.8, 0),
  V(-2.4, 3.4, -0.9), // the enclosure, still far off
  V(-3.5, 3.05, -0.9), // settling onto the door
  V(-3.6, 3.0, -0.9), // the door plane — the logo is dead centre
  V(-3.6, 10.0, -1.6), // tilt up the conduit as we climb past it
  V(-3.6, 11.5, -2), // keep looking up the vortex while descending
  V(0, 1.8, 0), // pan back to the data field at origin
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 4.9, 0), // tilt down so the brand mark frames above center
  V(0, 5.0, 0), // logo sits a bit above the middle, clear of the finale text
]

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  const { posCurve, tgtCurve } = useMemo(() => {
    // mobile (portrait) crops the wide establishing shot, so open tighter and
    // come in on the enclosure sooner — the door still has to read at 390px
    const positions = isMobile
      ? [V(-2.6, 5.0, 15.5), V(-0.6, 4.2, 9.5), ...POSITIONS.slice(2)]
      : POSITIONS
    const targets = isMobile
      ? [V(-5.0, 3.2, -2), V(-3.2, 3.3, -0.8), ...TARGETS.slice(2)]
      : TARGETS
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
    }
  }, [])

  useFrame(({ camera, pointer, clock }, delta) => {
    // single authority for scroll smoothing — runs even in free-cam mode so
    // the particle choreography still tracks scroll while you orbit
    const k = 1 - Math.exp(-delta * 3.2)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    // skip the first 6% of the path so it opens a bit closer to the warehouse
    const cp = 0.06 + p * 0.94
    posCurve.getPoint(cp, vPos.current)
    tgtCurve.getPoint(cp, vTgt.current)

    // shift the opening farm to the right (clears the hero copy on the left),
    // then ease the pan out by the descent so the dive, data column and logo
    // all stay centred
    const SCENE_SHIFT = 1.6
    const pan = SCENE_SHIFT * (1 - THREE.MathUtils.smoothstep(p, 0.16, 0.30))
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
