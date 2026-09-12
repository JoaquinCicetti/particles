import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { advanceScroll, scrollState } from '../lib/scroll'
import { ACTS, END_POSE, actEnd, actIndexAt, type Vec3 } from '../lib/acts'

/**
 * Scroll-driven cinematic camera: one settled pose per act.
 *   the farm, measuring → down onto the elevator, everything connecting →
 *   out of the vortex onto the structured board → the traces climbing →
 *   the brand mark.
 *
 * Sampled PIECEWISE PER ACT, not as one global arclength sweep. Inside an act
 * we ease with a 0.10/0.90 plateau, so the camera visibly SETTLES on that act's
 * pose while its copy fades in and holds — that settle is the whole point of a
 * predictable story. The curve stays CatmullRom 'centripetal' and is evaluated
 * at exactly i/n on the boundaries, so it passes THROUGH each knot: smooth
 * between acts, no global-reparameterisation rollercoaster.
 *
 * The poses live in src/lib/acts.ts — the timeline's single source of truth.
 */

const V = (v: Vec3) => new THREE.Vector3(v[0], v[1], v[2])

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

/** number of curve segments — knots are ACTS.length + END_POSE */
const N = ACTS.length

export default function CameraRig({ started }: { started: boolean }) {
  const parallax = useRef(new THREE.Vector2())
  const vPos = useRef(new THREE.Vector3())
  const vTgt = useRef(new THREE.Vector3())
  const intro = useRef(0)

  const { posCurve, tgtCurve } = useMemo(() => {
    // mobile (portrait) crops the wide establishing shot, so acts that need a
    // tighter framing carry their own pose instead of splicing the array
    const poses = ACTS.map((a) => (isMobile && a.cameraMobile ? a.cameraMobile : a.camera))
    return {
      posCurve: new THREE.CatmullRomCurve3([...poses.map((c) => V(c.pos)), V(END_POSE.pos)], false, 'centripetal'),
      tgtCurve: new THREE.CatmullRomCurve3([...poses.map((c) => V(c.target)), V(END_POSE.target)], false, 'centripetal'),
    }
  }, [])

  useFrame(({ camera, pointer }, delta) => {
    // scroll smoothing lives in lib/scroll now (idempotent per frame), so the
    // story survives this component unmounting; calling in keeps the camera in
    // lockstep with the frame it is about to draw
    advanceScroll(delta)
    const p = THREE.MathUtils.clamp(scrollState.smooth, 0, 1)

    const i = actIndexAt(p)
    const a = ACTS[i].at
    const u = (p - a) / (actEnd(i) - a)
    // plateau at both ends: the camera arrives, then waits while the copy reads
    const e = THREE.MathUtils.smoothstep(u, 0.1, 0.9)
    const cp = (i + e) / N
    posCurve.getPoint(cp, vPos.current)
    tgtCurve.getPoint(cp, vTgt.current)

    // intro reveal: once started, ease a gentle push-in (dolly + slight drop)
    // over ~1.7s so the scene opens with motion instead of a hard cut
    if (started) intro.current = Math.min(1, intro.current + delta / 1.7)
    const introE = THREE.MathUtils.smoothstep(intro.current, 0, 1)
    vPos.current.z += (1 - introE) * 5.5
    vPos.current.y += (1 - introE) * 1.4

    // pointer parallax, tapered to nothing over the last act. Kept small: the
    // old amplitude (plus an idle sin() drift, now gone) fought the settle.
    const calm = 1 - THREE.MathUtils.smoothstep(p, ACTS[N - 1].at, 1.0)
    parallax.current.x += (pointer.x - parallax.current.x) * Math.min(1, delta * 2.5)
    parallax.current.y += (pointer.y - parallax.current.y) * Math.min(1, delta * 2.5)
    vPos.current.x += parallax.current.x * 0.18 * calm
    vPos.current.y += parallax.current.y * 0.1 * calm

    camera.position.copy(vPos.current)
    camera.lookAt(vTgt.current)

    scrollState.focusDist = camera.position.distanceTo(vTgt.current)
  })

  return null
}
