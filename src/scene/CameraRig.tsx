import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide farm establishing → lateral drift → descent onto the elevator →
 *   inside the particle stream → pull back to the data field → drift through
 *   the volumetric PCB → settle facing the Growcast brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const POSITIONS = [
  V(-4, 4.4, 20), //   0.000  wide farm establishing (favor greenhouse, left)
  V(9.5, 6.2, 14), //  0.111  sweep right across the farm (milking)
  V(3.5, 8.5, 8), //   0.222  descent toward the elevator
  V(0.3, 5.2, 1.1), // 0.333  into the stream
  V(0, 4.2, 1.0), //   0.444  inside the stream
  V(0, 3.2, 9.5), //   0.556  pull back to the data field
  V(1.4, 3.3, 3.2), // 0.667  enter the PCB volume (weave +x)
  V(-1.3, 2.6, 0.4), //0.778  deep inside the slab (weave −x)
  V(0, 2.9, 5.2), //   0.889  pull back toward the mark
  V(0, 2.9, 7.6), //   1.000  face the brand mark
]

const TARGETS = [
  V(0, 3.4, 0),
  V(0, 4, 0),
  V(0, 6.5, 0),
  V(0, 8, 0),
  V(0, 10, 0),
  V(0, 2.6, 0),
  V(0, 2.9, 0),
  V(0, 2.9, -1.5), // look forward through the slab
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
