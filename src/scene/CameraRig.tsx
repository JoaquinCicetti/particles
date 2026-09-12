import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
// TEMPORARY: camera path A/B rig. See src/scene/cameraModes.ts for how to rip
// this out once a path is settled.
import {
  CAMERA_MODES,
  MOBILE_OPEN_P,
  MOBILE_OPEN_T,
  getCameraModeIndex,
} from './cameraModes'

/**
 * Scroll-driven cinematic camera. Position and look-target each follow a
 * CatmullRom path keyed to scroll progress, and the path deliberately mimics
 * the route the data takes (baseline mode):
 *   wide farm establishing → in from the front onto the Growcast enclosure →
 *   square in front of its door, on the brand mark → up past it following the
 *   conduit → inside the tower looking up the vortex → pull back to the
 *   structured rows → up through the circuit lanes → the brand mark.
 * Subtle pointer parallax and idle breathing keep static moments alive.
 */

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  // every mode's curves are built once and selected per frame, so switching
  // costs nothing and never re-renders this component
  const rigs = useMemo(
    () =>
      CAMERA_MODES.map((m) => {
        const positions = isMobile ? [...MOBILE_OPEN_P, ...m.positions.slice(2)] : m.positions
        const targets = isMobile ? [...MOBILE_OPEN_T, ...m.targets.slice(2)] : m.targets
        return {
          damp: m.damp,
          lead: m.lead,
          posCurve: new THREE.CatmullRomCurve3(positions, false, 'centripetal'),
          tgtCurve: new THREE.CatmullRomCurve3(targets, false, 'centripetal'),
        }
      }),
    [],
  )

  useFrame(({ camera, pointer, clock }, delta) => {
    const rig = rigs[getCameraModeIndex()] ?? rigs[0]

    // single authority for scroll smoothing — runs even in free-cam mode so
    // the particle choreography still tracks scroll while you orbit
    const k = 1 - Math.exp(-delta * rig.damp)
    scrollState.smooth += (scrollState.target - scrollState.smooth) * k
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    // skip the first 6% of the path so it opens a bit closer to the warehouse.
    // `lead` samples ahead of where we are, so the camera anticipates the move
    // rather than trailing it — the look-target leads harder than the body,
    // the way you turn your head before you turn your shoulders.
    const cp = 0.06 + p * 0.94
    const lead = rig.lead * 0.94
    rig.posCurve.getPoint(Math.min(1, cp + lead * 0.5), vPos.current)
    rig.tgtCurve.getPoint(Math.min(1, cp + lead * 1.5), vTgt.current)

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
