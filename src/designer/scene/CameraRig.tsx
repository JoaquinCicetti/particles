import { useCallback, useEffect, useRef, type ComponentRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { roofRise } from '../model/geometry'
import type { Room } from '../model/schema'
import { getActiveDesign, useDesigner } from '../store'

const VIEW_DIR = new THREE.Vector3(0.5, 0.62, 0.8).normalize()
const r3 = (v: number) => Math.round(v * 1000) / 1000

/**
 * Orbit camera. Restores the tab's saved view (or frames the room) on tab
 * switch, re-frames on request, and saves the view back, debounced.
 */
export default function CameraRig({ room }: { room: Room }) {
  const tabId = useDesigner((s) => s.activeId)
  const nonce = useDesigner((s) => s.frameNonce)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const ref = useRef<ComponentRef<typeof OrbitControls>>(null)
  const lastNonce = useRef(nonce)
  const span = Math.max(room.width, room.length, room.height + roofRise(room))

  // a big zone is seen from far away: push the near plane out with it, or
  // depth precision runs out and the floor z-fights its grid
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    cam.near = Math.max(0.05, span * 0.004)
    cam.updateProjectionMatrix()
    invalidate()
  }, [camera, span, invalidate])

  const fit = useCallback(() => {
    const c = ref.current
    if (!c) return
    const r = getActiveDesign().room
    const h = r.height + roofRise(r)
    // a tall, narrow silo needs to be seen from further back than its footprint says
    const dist = Math.max(4, Math.max(r.width, r.length) * 1.45 + h * (h > 6 ? 2 : 1))
    // a tall silo is framed around its middle, a room just above the floor
    c.target.set(0, h > 6 ? h * 0.4 : Math.min(h * 0.25, 0.8), 0)
    camera.position.copy(c.target).addScaledVector(VIEW_DIR, dist)
    c.update()
    invalidate()
  }, [camera, invalidate])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const cam = getActiveDesign().camera
    if (!cam) return fit()
    camera.position.set(cam.position.x, cam.position.y, cam.position.z)
    c.target.set(cam.target.x, cam.target.y, cam.target.z)
    c.update()
    invalidate()
  }, [tabId, camera, fit, invalidate])

  useEffect(() => {
    if (nonce === lastNonce.current) return
    lastNonce.current = nonce
    fit()
  }, [nonce, fit])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    let t: ReturnType<typeof setTimeout> | undefined
    const save = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        const p = camera.position
        const g = c.target
        useDesigner.getState().setCamera({
          position: { x: r3(p.x), y: r3(p.y), z: r3(p.z) },
          target: { x: r3(g.x), y: r3(g.y), z: r3(g.z) },
        })
      }, 600)
    }
    c.addEventListener('change', save)
    return () => {
      clearTimeout(t)
      c.removeEventListener('change', save)
    }
  }, [camera, tabId])

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      maxPolarAngle={Math.PI * 0.495}
      minDistance={0.6}
      maxDistance={span * 6}
    />
  )
}
