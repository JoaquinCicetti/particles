import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { advanceScroll, scrollState } from '../lib/scroll'
import { STORY_KNOTS, type Vec3 } from '../lib/acts'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress:
 *   wide farm establishing → lateral drift → descent onto the elevator →
 *   inside the particle stream → pull back to the structured rows → tilt up
 *   to follow the data rising through the circuit lanes → the brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 *
 * The knots live in src/lib/acts.ts — the timeline's single source of truth.
 */

const V = (v: Vec3) => new THREE.Vector3(v[0], v[1], v[2])

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  const { posCurve, tgtCurve } = useMemo(() => {
    const K = STORY_KNOTS
    // mobile (portrait) crops the wide establishing shot, so reframe the
    // opening onto the silo cluster (left of the tower) before the descent
    const src = isMobile
      ? {
          p: [...K.mobilePositions, ...K.positions.slice(2)],
          t: [...K.mobileTargets, ...K.targets.slice(2)],
        }
      : { p: K.positions, t: K.targets }
    const positions = src.p.map(V)
    const targets = src.t.map(V)
    return {
      posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
    }
  }, [])

  useFrame(({ camera, pointer, clock }, delta) => {
    // scroll smoothing lives in lib/scroll now (idempotent per frame), so the
    // story survives this component unmounting; calling in keeps the camera in
    // lockstep with the frame it is about to draw
    advanceScroll(delta)
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
