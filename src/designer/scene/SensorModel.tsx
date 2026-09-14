import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import sensorUrl from '../model/sensor.glb?url'
import { SENSOR_BODY_MAT, SENSOR_HEIGHT, type Tone } from './materials'

/**
 * The client's actual sensor, from its CAD export. The file is a bare mesh —
 * positions only, long axis Y, ~2 units tall — so it is normalized once:
 * normals computed, base on y = 0, centred in X/Z, scaled to SENSOR_HEIGHT.
 * Every sensor in every designer shares that one geometry.
 */

const cache = new WeakMap<THREE.Object3D, THREE.BufferGeometry>()

function normalized(scene: THREE.Object3D) {
  const hit = cache.get(scene)
  if (hit) return hit
  const found: THREE.BufferGeometry[] = []
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) found.push((o as THREE.Mesh).geometry)
  })
  const g = (found[0] ?? new THREE.BoxGeometry(0.25, 2, 0.25)).clone()
  g.computeBoundingBox()
  const b = g.boundingBox!
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2)
  const k = SENSOR_HEIGHT / Math.max(1e-6, b.max.y - b.min.y)
  g.scale(k, k, k)
  g.computeVertexNormals()
  g.computeBoundingSphere()
  cache.set(scene, g)
  return g
}

export default function SensorBody({ tone }: { tone: Tone }) {
  const { scene } = useGLTF(sensorUrl, false, false)
  const geometry = useMemo(() => normalized(scene), [scene])
  return <mesh geometry={geometry} material={SENSOR_BODY_MAT[tone]} />
}

useGLTF.preload(sensorUrl, false, false)
