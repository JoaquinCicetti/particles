import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EDGE, MAT, PLANT_GEO, POT_GEO, UNIT_BOX, UNIT_BOX_EDGES, UNIT_CYL, UNIT_CYL_EDGES, noRaycast, type Tone } from './materials'

type V3 = [number, number, number]

type PartProps = {
  size: V3
  position?: V3
  rotation?: V3
  material?: THREE.Material
  tone?: Tone | null
}

/** Unit box scaled to `size`, with copper edges when `tone` is set. */
export function Box({ size, position, rotation, material = MAT.body, tone }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={UNIT_BOX} material={material} scale={size} />
      {tone && <lineSegments geometry={UNIT_BOX_EDGES} material={EDGE[tone]} scale={size} raycast={noRaycast} />}
    </group>
  )
}

/** Unit cylinder; `size` = [diameter, height, diameter]. */
export function Cyl({ size, position, rotation, material = MAT.body, tone }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={UNIT_CYL} material={material} scale={size} />
      {tone && <lineSegments geometry={UNIT_CYL_EDGES} material={EDGE[tone]} scale={size} raycast={noRaycast} />}
    </group>
  )
}

/** Line segments from a flat [x,y,z, x,y,z, …] list (memoize the list). */
export function Lines({ points, material }: { points: number[]; material: THREE.LineBasicMaterial }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return g
  }, [points])
  useEffect(() => () => geo.dispose(), [geo])
  return <lineSegments geometry={geo} material={material} raycast={noRaycast} />
}

/** A grid of potted plants on a surface: [x, surfaceY, z] per plant. */
export function Plants({ spots, size }: { spots: V3[]; size: number }) {
  const leaf = useRef<THREE.InstancedMesh>(null)
  const pot = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((s) => s.invalidate)

  useLayoutEffect(() => {
    const l = leaf.current
    const p = pot.current
    if (!l || !p) return
    const o = new THREE.Object3D()
    const potH = size * 0.9
    spots.forEach(([x, y, z], i) => {
      o.rotation.set(0, 0, 0)
      o.position.set(x, y + potH / 2, z)
      o.scale.set(size * 1.5, potH, size * 1.5)
      o.updateMatrix()
      p.setMatrixAt(i, o.matrix)
      o.position.set(x, y + potH + size * 0.85, z)
      o.rotation.set(0, i * 1.37, 0)
      o.scale.set(size * 1.25, size * 1.1, size * 1.25)
      o.updateMatrix()
      l.setMatrixAt(i, o.matrix)
    })
    for (const m of [l, p]) {
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    }
    invalidate()
  }, [spots, size, invalidate])

  return (
    <group key={spots.length}>
      <instancedMesh ref={pot} args={[POT_GEO, MAT.pot, spots.length]} />
      <instancedMesh ref={leaf} args={[PLANT_GEO, MAT.plant, spots.length]} />
    </group>
  )
}
