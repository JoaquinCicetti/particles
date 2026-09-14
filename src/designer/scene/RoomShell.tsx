import { memo, useMemo } from 'react'
import { Grid, Html } from '@react-three/drei'
import * as THREE from 'three'
import { roofRise } from '../model/geometry'
import type { Room } from '../model/schema'
import { LINE, MAT, ROOF_GEO, noRaycast } from './materials'
import { Lines } from './parts'

/**
 * The zone itself. A box (a room, a cell, a shed): floor with a grid,
 * inward-facing single-sided walls — the ones nearest the camera cull away, a
 * dollhouse view from any angle — a copper outline and dimension callouts. A
 * round zone (a silo) gets the same treatment as a cylinder, with rings every
 * 2 m, under a see-through cone roof.
 */
function RoomShell({ room }: { room: Room }) {
  return room.shape === 'round' ? <RoundShell room={room} /> : <BoxShell room={room} />
}

/** Grid pitch grows with the space: 10 cm in a room, 1 m across a big zone. */
const gridCell = (span: number) => (span > 30 ? 1 : 0.1)

/**
 * The grid floats over the floor by a sliver that grows with the pitch: 2 mm is
 * enough in a room, but from far away the depth buffer can't tell it from the
 * floor and the two flicker through each other.
 */
function Floor({ w, l, span, round }: { w: number; l: number; span: number; round: boolean }) {
  const cell = gridCell(span)
  const lift = cell * 0.02
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} material={MAT.floor} raycast={noRaycast} geometry={round ? DISC_GEO : undefined} scale={round ? [w, w, 1] : undefined}>
        {!round && <planeGeometry args={[w, l]} />}
      </mesh>
      {!round && (
        <Grid
          position={[0, lift, 0]}
          args={[w, l]}
          cellSize={cell}
          cellThickness={0.5}
          cellColor="#3a3c30"
          sectionSize={cell * 10}
          sectionThickness={1}
          sectionColor="#7d8a4e"
          fadeDistance={1000}
          fadeStrength={0}
          raycast={noRaycast}
        />
      )}
      <Grid
        position={[0, -lift * 5, 0]}
        infiniteGrid
        cellSize={cell * 10}
        cellThickness={0.4}
        cellColor="#24252a"
        sectionSize={cell * 50}
        sectionThickness={0.7}
        sectionColor="#33362c"
        fadeDistance={span * 4}
        fadeStrength={1.5}
        raycast={noRaycast}
      />
    </>
  )
}

const BoxShell = memo(function BoxShell({ room }: { room: Room }) {
  const { width: W, length: L, height: H } = room
  const x = W / 2
  const z = L / 2
  const span = Math.max(W, L)
  // callouts sit further out as the space grows, so they never touch it
  const off = Math.max(0.35, span * 0.02)

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
    const o = off
    const t = off / 3
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
  }, [x, z, off])

  return (
    <group>
      <Floor w={W} l={L} span={span} round={false} />

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

      <Html position={[0, 0.02, z + off]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        {W.toFixed(2)} m
      </Html>
      <Html position={[x + off, 0.02, 0]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        {L.toFixed(2)} m
      </Html>
      <Html position={[-x, H + 0.12, -z]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        ↕ {H.toFixed(2)} m
      </Html>
    </group>
  )
})

const SEGMENTS = 64
const DISC_GEO = new THREE.CircleGeometry(0.5, SEGMENTS)
const SILO_WALL_GEO = new THREE.CylinderGeometry(0.5, 0.5, 1, SEGMENTS, 1, true)
// inside faces only: the half of the wall nearest the camera culls away, like a box room's
const SILO_WALL_MAT = MAT.wall.clone()
SILO_WALL_MAT.side = THREE.BackSide

function ring(r: number, y: number, out: number[], segments = SEGMENTS) {
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const b = ((i + 1) / segments) * Math.PI * 2
    out.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r)
  }
}

const RoundShell = memo(function RoundShell({ room }: { room: Room }) {
  const { width: D, height: H } = room
  const r = D / 2
  const rise = roofRise(room)
  const off = Math.max(0.35, D * 0.02)
  const lift = gridCell(D) * 0.02

  const outline = useMemo(() => {
    const p: number[] = []
    ring(r, 0.003, p)
    ring(r, H, p)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const cx = Math.cos(a) * r
      const cz = Math.sin(a) * r
      // wall seam, then the cone from the eave to the peak
      p.push(cx, 0, cz, cx, H, cz, cx, H, cz, 0, H + rise, 0)
    }
    return p
  }, [r, H, rise])

  const guides = useMemo(() => {
    const p: number[] = []
    for (let y = 2; y < H - 0.5; y += 2) ring(r, y, p)
    // floor: a ring per meter and two crossing diameters
    const step = D > 30 ? 5 : 1
    for (let rr = step; rr < r - 1e-3; rr += step) ring(rr, lift * 2, p, 48)
    p.push(-r, lift * 2, 0, r, lift * 2, 0, 0, lift * 2, -r, 0, lift * 2, r)
    return p
  }, [r, D, H, lift])

  const dims = useMemo(() => {
    const z = r + off
    const t = off / 3
    return [-r, 0.01, z, r, 0.01, z, -r, 0.01, z - t, -r, 0.01, z + t, r, 0.01, z - t, r, 0.01, z + t]
  }, [r, off])

  return (
    <group>
      <Floor w={D} l={D} span={D} round />
      <mesh geometry={SILO_WALL_GEO} material={SILO_WALL_MAT} scale={[D, H, D]} position={[0, H / 2, 0]} raycast={noRaycast} />
      <mesh geometry={ROOF_GEO} material={MAT.roof} scale={[D, rise, D]} position={[0, H + rise / 2, 0]} raycast={noRaycast} />

      <Lines points={outline} material={LINE.room} />
      <Lines points={guides} material={LINE.dim} />
      <Lines points={dims} material={LINE.dim} />

      <Html position={[0, 0.02, r + off]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        Ø {D.toFixed(2)} m
      </Html>
      <Html position={[-r, H + 0.12, 0]} center zIndexRange={[3, 0]} pointerEvents="none" className="dz-dim">
        ↕ {H.toFixed(2)} m
      </Html>
    </group>
  )
})

export default memo(RoomShell)
