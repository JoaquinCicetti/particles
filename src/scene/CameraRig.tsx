import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide farm establishing → lateral drift → descent to the data columns →
 *   columns view → settle facing the flat PCB → push in to the brand mark.
 * No dive into a swirl — the progression stays ordered and legible.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const POSITIONS = [
  V(-1, 6.2, 24), //    0.000  far, high, wide farm landscape
  V(6.5, 5.6, 18), //   0.143  drift right toward the warehouse
  V(0, 5.2, 14), //     0.286  descend toward the data field
  V(0, 3.6, 12), //     0.429  data columns view
  V(0.6, 2.9, 10.5), // 0.571  approach the PCB
  V(-0.5, 2.9, 9.2), // 0.714  PCB face-on
  V(0, 2.9, 8.2), //    0.857  ease toward the mark
  V(0, 2.9, 7.2), //    1.000  face the brand mark
]

const TARGETS = [
  V(0, 2.8, 0),
  V(1.5, 3.0, 0),
  V(0, 3.2, 0),
  V(0, 2.6, 0),
  V(0, 2.9, 0),
  V(0, 2.9, 0),
  V(0, 2.9, 0),
  V(0, 2.9, 0),
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
    // single authority for scroll smoothing
    const k = 1 - Math.exp(-delta * 3.2)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    posCurve.getPoint(p, vPos.current)
    tgtCurve.getPoint(p, vTgt.current)

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
