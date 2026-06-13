import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide establishing shot → lateral drift → descent onto the elevator →
 *   inside the particle stream → pull-back to the data field → convergence
 *   sphere → industrial board → brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const POSITIONS = [
  [0, 4.8, 23], //   0.000  wide establishing
  [7.5, 5.5, 15], // 0.125  lateral drift
  [3.5, 8.5, 7], //  0.250  descent toward elevator
  [0.3, 5.2, 1.1], // 0.375 into the stream
  [0, 4.2, 1.0], //  0.500  inside the stream
  [0, 3.0, 8.0], //  0.625  pull back to the data field
  [0, 2.9, 9.5], //  0.750  convergence sphere
  [0, 2.9, 10.6], // 0.875  industrial board (framed wide)
  [0, 2.9, 7.4], //  1.000  brand-mark reveal
].map((p) => new THREE.Vector3(...(p as [number, number, number])))

const TARGETS = [
  [0, 3.4, 0],
  [0, 4, 0],
  [0, 6.5, 0],
  [0, 8, 0],
  [0, 10, 0],
  [0, 2.6, 0],
  [0, 2.9, 0],
  [0, 2.9, 0],
  [0, 2.9, 0],
].map((p) => new THREE.Vector3(...(p as [number, number, number])))

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
    // single authority for scroll smoothing
    const k = 1 - Math.exp(-delta * 3.2)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    posCurve.getPoint(p, vPos.current)
    tgtCurve.getPoint(p, vTgt.current)

    // pointer parallax (eases toward pointer) + idle breathing
    parallax.current.x += (pointer.x - parallax.current.x) * Math.min(1, delta * 2.5)
    parallax.current.y += (pointer.y - parallax.current.y) * Math.min(1, delta * 2.5)
    const t = clock.elapsedTime
    vPos.current.x += parallax.current.x * 0.45 + Math.sin(t * 0.23) * 0.06
    vPos.current.y += parallax.current.y * 0.25 + Math.sin(t * 0.31) * 0.04

    camera.position.copy(vPos.current)
    camera.lookAt(vTgt.current)

    scrollState.focusDist = camera.position.distanceTo(vTgt.current)
  })

  return null
}
