import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FLOW_CURVES } from './particles/curves'
import { scrollState } from '../lib/scroll'
import { smoothstep } from '../lib/math'

/** Faint copper threads tracing the telemetry topology between structures. */
export default function Network() {
  const groupRef = useRef<THREE.Group>(null)

  const { lines, material } = useMemo(() => {
    const material = new THREE.LineBasicMaterial({
      color: '#b06a32',
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const lines = FLOW_CURVES.map(
      (curve) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)), material),
    )
    return { lines, material }
  }, [])

  useFrame(() => {
    const fade = 1 - smoothstep(0.28, 0.42, scrollState.smooth)
    material.opacity = 0.08 * fade
    if (groupRef.current) groupRef.current.visible = fade > 0.01
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  )
}
