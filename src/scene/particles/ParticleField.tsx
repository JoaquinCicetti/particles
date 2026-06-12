import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { flowPath } from './paths'

const COUNT = 6000
const SPEED = 0.04
const SPREAD = 1.1

/**
 * Placeholder particle system: COUNT points flow along `flowPath`, each with
 * a random progress offset and a radial jitter that tightens as the particle
 * approaches the end of the path — a first hint of the future "merge into
 * the electric board" moment.
 *
 * CPU-updated buffer; fine at this count. Swap for a GPGPU/shader approach
 * if the final scene needs 100k+ particles.
 */
export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, offsets, jitter } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const offsets = new Float32Array(COUNT)
    const jitter = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      offsets[i] = Math.random()
      jitter[i * 3] = (Math.random() - 0.5) * 2
      jitter[i * 3 + 1] = (Math.random() - 0.5) * 2
      jitter[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return { positions, offsets, jitter }
  }, [])

  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const points = pointsRef.current
    if (!points) return
    const attr = points.geometry.getAttribute('position') as THREE.BufferAttribute
    const t = clock.elapsedTime * SPEED

    for (let i = 0; i < COUNT; i++) {
      const u = (offsets[i] + t) % 1
      flowPath.getPointAt(u, point)
      // spread tapers toward the end of the path so the stream converges
      const spread = SPREAD * (1 - u * 0.85)
      attr.setXYZ(
        i,
        point.x + jitter[i * 3] * spread,
        point.y + jitter[i * 3 + 1] * spread,
        point.z + jitter[i * 3 + 2] * spread,
      )
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#4cc9f0"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
