import { memo, useMemo } from 'react'
import { Grid, Html } from '@react-three/drei'
import type { Room } from '../model/schema'
import { LINE, MAT, noRaycast } from './materials'
import { Lines } from './parts'

/**
 * Floor with a 10 cm / 1 m grid, inward-facing single-sided walls (the ones
 * nearest the camera cull away — a dollhouse view from any angle), a copper
 * outline of the room box and dimension callouts.
 */
function RoomShell({ room }: { room: Room }) {
  const { width: W, length: L, height: H } = room
  const x = W / 2
  const z = L / 2

  const edges = useMemo(() => {
    const p: number[] = []
    const rect = (y: number) => p.push(-x, y, -z, x, y, -z, x, y, -z, x, y, z, x, y, z, -x, y, z, -x, y, z, -x, y, -z)
    rect(0.003)
    rect(H)
    for (const [a, b] of [
      [-x, -z],
      [x, -z],
      [x, z],
      [-x, z],
    ])
      p.push(a, 0, b, a, H, b)
    return p
  }, [x, z, H])

  const dims = useMemo(() => {
    const o = 0.35
    const t = 0.12
    return [
      // width, along the front edge
      -x, 0.01, z + o, x, 0.01, z + o,
      -x, 0.01, z + o - t, -x, 0.01, z + o + t,
      x, 0.01, z + o - t, x, 0.01, z + o + t,
      // length, along the right edge
      x + o, 0.01, -z, x + o, 0.01, z,
      x + o - t, 0.01, -z, x + o + t, 0.01, -z,
      x + o - t, 0.01, z, x + o + t, 0.01, z,
    ]
  }, [x, z])

  const span = Math.max(W, L)

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={MAT.floor} raycast={noRaycast}>
        <planeGeometry args={[W, L]} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[W, L]}
        cellSize={0.1}
        cellThickness={0.5}
        cellColor="#3b2416"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#8a5528"
        fadeDistance={1000}
        fadeStrength={0}
        raycast={noRaycast}
      />
      <Grid
        position={[0, -0.01, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1d130c"
        sectionSize={5}
        sectionThickness={0.7}
        sectionColor="#33200f"
        fadeDistance={span * 4}
        fadeStrength={1.5}
        raycast={noRaycast}
      />

      <mesh position={[0, H / 2, -z]} material={MAT.wall} raycast={noRaycast}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[0, H / 2, z]} rotation-y={Math.PI} material={MAT.wall} raycast={noRaycast}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[-x, H / 2, 0]} rotation-y={Math.PI / 2} material={MAT.wall} raycast={noRaycast}>
        <planeGeometry args={[L, H]} />
      </mesh>
      <mesh position={[x, H / 2, 0]} rotation-y={-Math.PI / 2} material={MAT.wall} raycast={noRaycast}>
        <planeGeometry args={[L, H]} />
      </mesh>

      <Lines points={edges} material={LINE.room} />
      <Lines points={dims} material={LINE.dim} />

      <Html position={[0, 0.02, z + 0.35]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        {W.toFixed(2)} m
      </Html>
      <Html position={[x + 0.35, 0.02, 0]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        {L.toFixed(2)} m
      </Html>
      <Html position={[-x, H + 0.12, -z]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        ↕ {H.toFixed(2)} m
      </Html>
    </group>
  )
}

export default memo(RoomShell)
