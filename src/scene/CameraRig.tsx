import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide farm establishing → lateral drift → descent onto the elevator →
 *   inside the particle stream → pull back to the structured rows → tilt up
 *   to follow the data rising through the circuit lanes → the brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const POSITIONS = [
  V(-1, 6.2, 24), //   0.000  far, high, wide farm landscape
  V(6.5, 5.8, 18), //  0.111  drift right toward the warehouse
  V(-1.5, 8.0, 5.5), //0.222  descent toward the (relocated) elevator
  V(-3.0, 5.2, 0.8), //0.333  into the stream
  V(-3.6, 4.2, -1.0), //0.444 inside the stream
  V(0, 3.0, 12.5), //  0.556  pull back to the structured rows
  V(0, 3.6, 12), //    0.667  rows settle, the riser begins
  V(0, 5.0, 11.5), //  0.778  follow the data rising up the lanes
  V(0, 6.2, 10), //    0.889  frame the brand mark forming
  V(0, 6.2, 8.8), //   1.000  the brand mark
]

const TARGETS = [
  V(0, 2.8, 0),
  V(1.5, 3.2, 0),
  V(-3.6, 7.0, -2), // look at the relocated tower
  V(-3.6, 8.5, -2),
  V(-3.6, 10.0, -2),
  V(0, 1.8, 0), // pan back to the data field at origin
  V(0, 2.6, 0),
  V(0, 4.2, 0),
  V(0, 6.0, 0),
  V(0, 6.2, 0),
]

export default function CameraRig() {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())

  const { posCurve, tgtCurve } = useMemo(
    () => ({
      posCurve: new THREE.CatmullRomCurve3(POSITIONS, false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3(TARGETS, false, 'centripetal'),
    }),
    [],
  )

  useFrame(({ camera, pointer, clock }, delta) => {
    // single authority for scroll smoothing — runs even in free-cam mode so
    // the particle choreography still tracks scroll while you orbit
    const k = 1 - Math.exp(-delta * 3.2)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    // dev free-cam: OrbitControls owns the camera; just keep DOF sane
    if (scrollState.freeCam) {
      scrollState.focusDist = camera.position.distanceTo(vTgt.current)
      return
    }

    // skip the first 6% of the path so it opens a bit closer to the warehouse
    const cp = 0.06 + p * 0.94
    posCurve.getPoint(cp, vPos.current)
    tgtCurve.getPoint(cp, vTgt.current)

    // translate the whole scene to the right (pan the camera left); ease the
    // pan out toward the finale so the brand mark lands centred
    const SCENE_SHIFT = 1.4
    const pan = SCENE_SHIFT * (1 - THREE.MathUtils.smoothstep(p, 0.86, 1.0))
    vPos.current.x -= pan
    vTgt.current.x -= pan

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
