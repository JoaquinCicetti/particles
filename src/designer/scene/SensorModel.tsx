import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import growcastUrl from '../model/growcast.glb?url'
import sensorUrl from '../model/sensor.glb?url'
import { GC_MAT, SENSOR_HEIGHT, type Tone } from './materials'

/**
 * The client's own hardware, from its CAD exports: the sensor and the Growcast+
 * device. Each file is a bare mesh (positions only), so it is normalized once —
 * turned upright where the export needs it, normals computed, base on y = 0,
 * centred in X/Z and scaled to a height of 1 — and drawn at its real height.
 */

type Turn = readonly [number, number, number]

const cache = new WeakMap<THREE.Object3D, THREE.BufferGeometry>()

function normalized(scene: THREE.Object3D, turn: Turn | null) {
  const hit = cache.get(scene)
  if (hit) return hit
  const found: THREE.BufferGeometry[] = []
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) found.push((o as THREE.Mesh).geometry)
  })
  const g = (found[0] ?? new THREE.BoxGeometry(1, 1, 1)).clone()
  if (turn) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...turn)))
  g.computeBoundingBox()
  const b = g.boundingBox!
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2)
  const k = 1 / Math.max(1e-6, b.max.y - b.min.y)
  g.scale(k, k, k)
  g.computeVertexNormals()
  g.computeBoundingSphere()
  cache.set(scene, g)
  return g
}

function GlbBody({ url, turn, height, tone }: { url: string; turn: Turn | null; height: number; tone: Tone }) {
  const { scene } = useGLTF(url, false, false)
  const geometry = useMemo(() => normalized(scene, turn), [scene, turn])
  return <mesh geometry={geometry} material={GC_MAT[tone]} scale={height} />
}

/** The sensor export is already upright (long axis Y). */
export function SensorBody({ tone }: { tone: Tone }) {
  return <GlbBody url={sensorUrl} turn={null} height={SENSOR_HEIGHT} tone={tone} />
}

/** The Growcast+ export is upright too: antenna up, the status slot on its +Z face. */
export function GrowcastPlusBody({ tone, height }: { tone: Tone; height: number }) {
  return <GlbBody url={growcastUrl} turn={null} height={height} tone={tone} />
}

useGLTF.preload(sensorUrl, false, false)
useGLTF.preload(growcastUrl, false, false)
