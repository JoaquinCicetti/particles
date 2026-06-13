import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { BOARD, iconWorldPos } from './particles/board'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide establishing → lateral drift → descent onto the elevator → inside
 *   the particle stream → pull back to the data field → board face-on →
 *   fly into the Growcast icon (top-right of the board).
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export default function CameraRig() {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())

  const { posCurve, tgtCurve } = useMemo(() => {
    const icon = iconWorldPos()
    const cy = BOARD.centerY

    const positions = [
      V(0, 4.8, 23), //    0.000  wide establishing
      V(7.5, 5.5, 15), //  0.125  lateral drift
      V(3.5, 8.5, 7), //   0.250  descent toward elevator
      V(0.3, 5.2, 1.1), // 0.375  into the stream
      V(0, 4.2, 1.0), //   0.500  inside the stream
      V(0, 3.2, 8.6), //   0.625  pull back to the data field
      V(0, cy, 9.2), //    0.750  board face-on
      icon.clone().add(V(-1.1, -1.3, 3.6)), // 0.875  approaching the icon
      icon.clone().add(V(-0.2, -0.22, 1.55)), // 1.000 icon fills the frame
    ]

    const targets = [
      V(0, 3.4, 0),
      V(0, 4, 0),
      V(0, 6.5, 0),
      V(0, 8, 0),
      V(0, 10, 0),
      V(0, 2.6, 0),
      V(0, cy, 0), //                    board center
      icon.clone().lerp(V(0, cy, 0), 0.4), // drift toward the icon
      icon.clone(), //                   locked on the icon
    ]

    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
    }
  }, [])

  useFrame(({ camera, pointer, clock }, delta) => {
    // single authority for scroll smoothing
    const k = 1 - Math.exp(-delta * 3.2)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    posCurve.getPoint(p, vPos.current)
    tgtCurve.getPoint(p, vTgt.current)

    // pointer parallax (eases toward pointer) + idle breathing.
    // both taper to zero as we fly into the icon so the finale holds steady.
    const calm = 1 - THREE.MathUtils.smoothstep(p, 0.82, 1.0)
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
