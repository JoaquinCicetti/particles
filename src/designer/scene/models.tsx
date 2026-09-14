import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bodyHeight } from '../model/geometry'
import type { Item, Room } from '../model/schema'
import {
  CONE_GEO,
  EDGE,
  HIT_GEO,
  LINE,
  MAT,
  MIST_GEO,
  SAUSAGE_GEO,
  SENSOR_HEIGHT,
  SENSOR_MAT,
  TORUS_GEO,
  TORUS_MID_GEO,
  UNIT_BOX,
  UNIT_BOX_EDGES,
  UNIT_CYL,
  noRaycast,
  type Tone,
} from './materials'
import { Box, Cyl, Lines, Plants } from './parts'
import SensorBody from './SensorModel'

/**
 * Procedural low-poly models, built in the item's local frame: origin at the
 * footprint centre on its base (floor, or the mount height for hung items),
 * width along X, depth along Z, the "front" facing +Z. `top` is the height of
 * the zone right above the item — its ceiling, or a silo's cone — which is
 * where a hanging sensor's cable ends.
 */

type Props = { item: Item; room: Room; tone: Tone; top: number }
type V3 = [number, number, number]

const MAX_PLANTS = 400
/** cap for any instanced load (cheese wheels, sausages, crates) */
const MAX_INSTANCES = 900

const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

const Q = new THREE.Quaternion()
const E = new THREE.Euler()
const mat4 = (p: V3, s: V3, r: V3 = [0, 0, 0]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), Q.clone().setFromEuler(E.set(...r)), new THREE.Vector3(...s))

/** One instanced draw call for many copies of a part. */
function Scatter({
  geometry,
  material,
  matrices,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  matrices: THREE.Matrix4[]
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    matrices.forEach((mx, i) => m.setMatrixAt(i, mx))
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
    invalidate()
  }, [matrices, invalidate])
  if (!matrices.length) return null
  return <instancedMesh key={matrices.length} ref={ref} args={[geometry, material, matrices.length]} />
}

/** Four posts at the corners of a w × d footprint, from `y0` up to `top`. */
function Posts({ w, d, y0 = 0, top, size = 0.04, tone }: { w: number; d: number; y0?: number; top: number; size?: number; tone: Tone }) {
  const px = w / 2 - size / 2
  const pz = d / 2 - size / 2
  const h = top - y0
  return (
    <>
      {[
        [-px, -pz],
        [px, -pz],
        [-px, pz],
        [px, pz],
      ].map(([x, z], i) => (
        <Box key={i} size={[size, h, size]} position={[x, y0 + h / 2, z]} material={MAT.metal} tone={tone} />
      ))}
    </>
  )
}

function plantSpots(w: number, d: number, levels: number[], pitch: number): Array<[number, number, number]> {
  const nx = Math.max(1, Math.floor(w / pitch))
  const nz = Math.max(1, Math.floor(d / pitch))
  if (nx * nz * levels.length > MAX_PLANTS) return []
  const out: Array<[number, number, number]> = []
  for (const y of levels)
    for (let i = 0; i < nx; i++)
      for (let k = 0; k < nz; k++) out.push([((i + 0.5) * w) / nx - w / 2, y, ((k + 0.5) * d) / nz - d / 2])
  return out
}

// ── grow room ────────────────────────────────────────────────────

function Rack({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const tiers = H >= 1.6 ? 3 : H >= 1 ? 2 : 1
  const gap = (H - 0.15) / tiers
  const shelves = useMemo(() => Array.from({ length: tiers }, (_, i) => 0.15 + i * gap), [tiers, gap])
  const spots = useMemo(() => plantSpots(w, d, shelves.map((y) => y + 0.015), 0.26), [w, d, shelves])
  return (
    <group>
      <Posts w={w} d={d} top={H} tone={tone} />
      {shelves.map((y, i) => (
        <group key={i}>
          <Box size={[w, 0.03, d]} position={[0, y, 0]} material={MAT.tray} tone={tone} />
          {/* front/back lips: a bare slab reads as a floating plane */}
          <Box size={[w, 0.035, 0.018]} position={[0, y + 0.03, -d / 2 + 0.009]} material={MAT.metal} />
          <Box size={[w, 0.035, 0.018]} position={[0, y + 0.03, d / 2 - 0.009]} material={MAT.metal} />
        </group>
      ))}
      <Box size={[w, 0.03, d]} position={[0, H - 0.015, 0]} material={MAT.metal} tone={tone} />
      <Plants spots={spots} size={Math.min(0.1, gap * 0.22)} />
    </group>
  )
}

function Table({ item, tone }: Props) {
  const { width: w, depth: d } = item
  const top = 0.72
  const lx = w / 2 - 0.08
  const lz = d / 2 - 0.08
  const spots = useMemo(() => plantSpots(w - 0.1, d - 0.1, [top + 0.1], 0.42), [w, d])
  return (
    <group>
      {[
        [-lx, -lz],
        [lx, -lz],
        [-lx, lz],
        [lx, lz],
      ].map(([x, z], i) => (
        <Box key={i} size={[0.05, top, 0.05]} position={[x, top / 2, z]} material={MAT.metal} tone={tone} />
      ))}
      <Box size={[w, 0.1, d]} position={[0, top + 0.05, 0]} material={MAT.tray} tone={tone} />
      <Box size={[w - 0.08, 0.005, d - 0.08]} position={[0, top + 0.1, 0]} material={MAT.water} />
      <Plants spots={spots} size={0.13} />
    </group>
  )
}

function Light({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const y = item.y ?? 0
  const bars = Math.min(10, Math.max(2, Math.round(w / 0.16)))
  const pitch = w / bars
  const drop = room.height - y - 0.08
  const cables = useMemo(
    () => (drop > 0.02 ? [-w * 0.35, 0.08, 0, -w * 0.35, 0.08 + drop, 0, w * 0.35, 0.08, 0, w * 0.35, 0.08 + drop, 0] : []),
    [w, drop],
  )
  return (
    <group>
      {Array.from({ length: bars }, (_, i) => {
        const x = -w / 2 + pitch * (i + 0.5)
        return (
          <group key={i}>
            <Box size={[pitch * 0.55, 0.025, d]} position={[x, 0.02, 0]} material={MAT.shell} tone={tone} />
            <Box size={[pitch * 0.42, 0.004, d * 0.97]} position={[x, 0.006, 0]} material={MAT.led} />
          </group>
        )
      })}
      <Box size={[w, 0.03, 0.035]} position={[0, 0.045, -d / 2 + 0.0175]} material={MAT.metal} tone={tone} />
      <Box size={[w, 0.03, 0.035]} position={[0, 0.045, d / 2 - 0.0175]} material={MAT.metal} tone={tone} />
      <Box size={[0.3, 0.05, 0.14]} position={[0, 0.085, 0]} material={MAT.body} tone={tone} />
      {cables.length > 0 && <Lines points={cables} material={LINE.wire} />}
      {y > 0.25 && (
        <mesh geometry={CONE_GEO} material={MAT.cone} position={[0, -y / 2, 0]} scale={[w, y, d]} raycast={noRaycast} />
      )}
    </group>
  )
}

function Climate({ item, tone }: Props) {
  const { width: w, depth: d } = item
  const h = 0.3
  const slats = 6
  const face = d / 2
  return (
    <group>
      <Box size={[w, h, d]} position={[0, h / 2, 0]} material={MAT.shell} tone={tone} />
      {/* intake grille on the front face — the only side normally in view */}
      {Array.from({ length: slats }, (_, i) => (
        <Box
          key={i}
          size={[w * 0.9, ((h * 0.6) / slats) * 0.62, 0.012]}
          position={[0, h * 0.34 + (h * 0.58 * (i + 0.5)) / slats, face + 0.004]}
          rotation={[0.5, 0, 0]}
          material={MAT.louver}
        />
      ))}
      {/* discharge vane under the grille, angled down into the room */}
      <Box size={[w * 0.9, 0.03, 0.055]} position={[0, h * 0.17, face - 0.008]} rotation={[0.75, 0, 0]} material={MAT.louver} />
      {/* bezel: a thin frame reads as a moulded case rather than a bare box */}
      <Box size={[w, 0.016, 0.016]} position={[0, h - 0.008, face + 0.004]} material={MAT.metal} />
      <Box size={[w, 0.016, 0.016]} position={[0, 0.008, face + 0.004]} material={MAT.metal} />
      <Box size={[0.016, h, 0.016]} position={[-w / 2 + 0.008, h / 2, face + 0.004]} material={MAT.metal} />
      <Box size={[0.016, h, 0.016]} position={[w / 2 - 0.008, h / 2, face + 0.004]} material={MAT.metal} />
      <Box size={[0.03, 0.012, 0.006]} position={[w * 0.38, h * 0.14, face + 0.012]} material={MAT.led} />
    </group>
  )
}

const FAN_BLADES = 4
const FAN_SPOKES = 4

function Fan({ tone }: Props) {
  return (
    <group>
      <Cyl size={[0.17, 0.025, 0.17]} position={[0, 0.012, 0]} material={MAT.metal} tone={tone} />
      <Box size={[0.028, 0.15, 0.028]} position={[0, 0.1, 0]} material={MAT.metal} />
      {/* tilt yoke */}
      <Box size={[0.05, 0.05, 0.022]} position={[0, 0.18, 0]} material={MAT.shell} />
      <group position={[0, 0.3, 0]}>
        <mesh geometry={TORUS_GEO} material={MAT.metal} />
        <mesh geometry={TORUS_MID_GEO} material={MAT.metal} />
        {/* cage spokes: one bar spans the guard, so four bars read as eight */}
        {Array.from({ length: FAN_SPOKES }, (_, i) => (
          <Box
            key={i}
            size={[0.005, 0.34, 0.005]}
            rotation={[0, 0, (i * Math.PI) / FAN_SPOKES]}
            material={MAT.metal}
          />
        ))}
        <Cyl size={[0.07, 0.075, 0.07]} rotation={[Math.PI / 2, 0, 0]} material={MAT.shell} tone={tone} />
        {/* Each blade is pitched inside a hub-angle group, so the pitch turns
            about the blade's OWN long axis. Pitching and indexing in one Euler
            can't do that: the default 'XYZ' order applies the hub angle first,
            leaving the pitch on the world Y, and only the 12-o'clock blade
            reads as a helix while the rest go edge-on. */}
        {Array.from({ length: FAN_BLADES }, (_, i) => (
          <group key={i} rotation={[0, 0, (-i * Math.PI * 2) / FAN_BLADES]}>
            <Box
              size={[0.085, 0.135, 0.006]}
              position={[0, 0.085, 0.022]}
              rotation={[0, 0.38, 0]}
              material={MAT.shell}
            />
          </group>
        ))}
      </group>
    </group>
  )
}

function Humidifier({ item, tone }: Props) {
  const r = Math.min(item.width, item.depth) / 2
  const nozzle = 0.69
  return (
    <group>
      <Cyl size={[r * 1.8, 0.55, r * 1.8]} position={[0, 0.275, 0]} material={MAT.shell} tone={tone} />
      {/* tank seam + water line */}
      <Cyl size={[r * 1.86, 0.012, r * 1.86]} position={[0, 0.2, 0]} material={MAT.metal} />
      <Cyl size={[r * 1.84, 0.015, r * 1.84]} position={[0, 0.42, 0]} material={MAT.led} />
      <Cyl size={[r * 1.2, 0.08, r * 1.2]} position={[0, 0.59, 0]} material={MAT.metal} tone={tone} />
      <Cyl size={[r * 0.5, 0.06, r * 0.5]} position={[0, nozzle - 0.03, 0]} material={MAT.body} tone={tone} />
      <mesh
        geometry={MIST_GEO}
        material={MAT.mist}
        position={[0, nozzle + 0.3, 0]}
        scale={[r * 2.4, 0.6, r * 2.4]}
        raycast={noRaycast}
      />
    </group>
  )
}

// ── silo ─────────────────────────────────────────────────────────

/** Centrifugal aeration fan at the base of the silo; its outlet duct points at +Z. */
function Aerator({ tone }: Props) {
  const axisY = 0.5
  return (
    <group>
      <Box size={[0.8, 0.06, 1]} position={[0, 0.03, 0]} material={MAT.body} tone={tone} />
      {[-0.3, 0.3].map((x) => (
        <Box key={x} size={[0.05, axisY - 0.06, 0.05]} position={[x * 0.9, 0.06 + (axisY - 0.06) / 2, -0.15]} material={MAT.metal} />
      ))}
      {/* scroll housing, axis along X */}
      <Cyl size={[0.78, 0.34, 0.78]} position={[0, axisY, -0.15]} rotation={[0, 0, Math.PI / 2]} material={MAT.shell} tone={tone} />
      <Cyl size={[0.3, 0.36, 0.3]} position={[-0.001, axisY, -0.15]} rotation={[0, 0, Math.PI / 2]} material={MAT.louver} />
      {/* motor on the drive side */}
      <Cyl size={[0.28, 0.3, 0.28]} position={[0.32, axisY, -0.15]} rotation={[0, 0, Math.PI / 2]} material={MAT.body} tone={tone} />
      {/* tangential outlet + flange */}
      <Box size={[0.3, 0.3, 0.55]} position={[0, axisY + 0.22, 0.2]} material={MAT.shell} tone={tone} />
      <Box size={[0.38, 0.38, 0.04]} position={[0, axisY + 0.22, 0.49]} material={MAT.metal} />
    </group>
  )
}

// ── curing room ──────────────────────────────────────────────────

function CheeseRack({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const tiers = clampN(Math.floor((H - 0.1) / 0.4), 1, 6)
  const gap = (H - 0.15) / tiers
  const shelves = useMemo(() => Array.from({ length: tiers }, (_, i) => 0.15 + i * gap), [tiers, gap])
  const wheels = useMemo(() => {
    const nx = Math.max(1, Math.floor(w / 0.35))
    const nz = Math.max(1, Math.floor(d / 0.32))
    if (nx * nz * shelves.length > MAX_INSTANCES) return []
    const dia = Math.min(0.28, (w / nx) * 0.8, (d / nz) * 0.85)
    const h = Math.min(0.11, gap * 0.4)
    const out: THREE.Matrix4[] = []
    for (const y of shelves)
      for (let i = 0; i < nx; i++)
        for (let k = 0; k < nz; k++)
          out.push(mat4([((i + 0.5) * w) / nx - w / 2, y + 0.015 + h / 2, ((k + 0.5) * d) / nz - d / 2], [dia, h, dia]))
    return out
  }, [w, d, shelves, gap])
  return (
    <group>
      <Posts w={w} d={d} top={H} tone={tone} />
      {shelves.map((y, i) => (
        <Box key={i} size={[w, 0.03, d]} position={[0, y, 0]} material={MAT.wood} tone={tone} />
      ))}
      <Box size={[w, 0.03, d]} position={[0, H - 0.015, 0]} material={MAT.metal} tone={tone} />
      <Scatter geometry={UNIT_CYL} material={MAT.cheese} matrices={wheels} />
    </group>
  )
}

/** Hanging frame for cured meats: bars along the width, sausages hanging from them. */
function Hanger({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const bars = d >= 0.6 ? 3 : 2
  const levels = useMemo(() => (H >= 1.5 ? [H - 0.06, H * 0.5] : [H - 0.06]), [H])
  const len = Math.min(0.45, (H / levels.length) * 0.6)
  const barZ = useMemo(() => Array.from({ length: bars }, (_, i) => -d / 2 + (d * (i + 0.5)) / bars), [bars, d])
  const sausages = useMemo(() => {
    const n = Math.max(1, Math.floor((w - 0.1) / 0.11))
    if (n * bars * levels.length > MAX_INSTANCES) return []
    const out: THREE.Matrix4[] = []
    levels.forEach((y, l) =>
      barZ.forEach((z, b) => {
        for (let i = 0; i < n; i++) {
          const sway = (((i * 7 + b * 3 + l) % 5) - 2) * 0.03
          out.push(mat4([-w / 2 + 0.05 + ((i + 0.5) * (w - 0.1)) / n, y - 0.02 - len / 2, z], [0.05, len / 2, 0.05], [sway, 0, sway]))
        }
      }),
    )
    return out
  }, [w, bars, levels, barZ, len])
  return (
    <group>
      <Posts w={w} d={d} top={H} tone={tone} />
      <Box size={[w, 0.04, 0.04]} position={[0, H - 0.02, -d / 2 + 0.02]} material={MAT.metal} tone={tone} />
      <Box size={[w, 0.04, 0.04]} position={[0, H - 0.02, d / 2 - 0.02]} material={MAT.metal} tone={tone} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[0.06, 0.03, d]} position={[s * (w / 2 - 0.03), 0.015, 0]} material={MAT.metal} />
          {levels.map((y) => (
            <Box key={y} size={[0.04, 0.04, d]} position={[s * (w / 2 - 0.02), y, 0]} material={MAT.metal} />
          ))}
        </group>
      ))}
      {levels.map((y) =>
        barZ.map((z) => <Box key={`${y}-${z}`} size={[w, 0.02, 0.02]} position={[0, y, z]} material={MAT.metal} />),
      )}
      <Scatter geometry={SAUSAGE_GEO} material={MAT.meat} matrices={sausages} />
    </group>
  )
}

const PALLET_H = 0.144

/** Slatted wooden pallet with its load of crates stacked up to the body height. */
function Pallet({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const boards = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const rows = [-d / 2 + 0.05, 0, d / 2 - 0.05]
    const cols = [-w / 2 + 0.05, 0, w / 2 - 0.05]
    for (const z of rows) {
      out.push(mat4([0, 0.011, z], [w, 0.022, 0.1]))
      out.push(mat4([0, 0.111, z], [w, 0.022, 0.1]))
      for (const x of cols) out.push(mat4([x, 0.061, z], [0.1, 0.078, 0.1]))
    }
    const n = Math.max(3, Math.round(w / 0.17))
    const bw = Math.min(0.1, (w / n) * 0.7)
    for (let i = 0; i < n; i++) out.push(mat4([-w / 2 + bw / 2 + (i * (w - bw)) / (n - 1), 0.133, 0], [bw, 0.022, d]))
    return out
  }, [w, d])
  const crates = useMemo(() => {
    const layers = Math.floor((H - PALLET_H) / 0.26)
    const nx = Math.max(1, Math.round(w / 0.6))
    const nz = Math.max(1, Math.round(d / 0.5))
    if (layers < 1 || nx * nz * layers > MAX_INSTANCES) return []
    const out: THREE.Matrix4[] = []
    for (let l = 0; l < layers; l++)
      for (let i = 0; i < nx; i++)
        for (let k = 0; k < nz; k++)
          out.push(
            mat4(
              [-w / 2 + ((i + 0.5) * w) / nx, PALLET_H + 0.125 + l * 0.26, -d / 2 + ((k + 0.5) * d) / nz],
              [w / nx - 0.03, 0.24, d / nz - 0.03],
            ),
          )
    return out
  }, [w, d, H])
  return (
    <group>
      <Scatter geometry={UNIT_BOX} material={MAT.wood} matrices={boards} />
      <lineSegments geometry={UNIT_BOX_EDGES} material={EDGE[tone]} scale={[w, PALLET_H, d]} position={[0, PALLET_H / 2, 0]} raycast={noRaycast} />
      <Scatter geometry={UNIT_BOX} material={MAT.crate} matrices={crates} />
    </group>
  )
}

/** Rolling trolley: four posts on casters, shelves with a few loads. */
function Trolley({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const wheel = 0.1
  const count = clampN(Math.round((H - wheel - 0.1) / 0.35), 2, 6)
  const gap = (H - wheel - 0.06) / count
  const shelves = useMemo(() => Array.from({ length: count }, (_, i) => wheel + 0.04 + i * gap), [count, gap])
  const loads = useMemo(() => {
    const n = Math.max(1, Math.floor(w / 0.35))
    const h = Math.min(0.14, gap * 0.5)
    const out: THREE.Matrix4[] = []
    shelves.forEach((y, s) => {
      for (let i = 0; i < n; i++) {
        if ((i + s) % 3 === 2) continue
        out.push(mat4([-w / 2 + ((i + 0.5) * w) / n, y + 0.015 + h / 2, 0], [Math.min(0.26, (w / n) * 0.8), h, d * 0.7]))
      }
    })
    return out
  }, [w, d, shelves, gap])
  const cx = w / 2 - 0.06
  const cz = d / 2 - 0.06
  return (
    <group>
      <Posts w={w} d={d} y0={wheel} top={H} size={0.03} tone={tone} />
      {shelves.map((y, i) => (
        <Box key={i} size={[w, 0.02, d]} position={[0, y, 0]} material={MAT.tray} tone={tone} />
      ))}
      <Box size={[w, 0.02, d]} position={[0, H - 0.01, 0]} material={MAT.metal} tone={tone} />
      {[
        [-cx, -cz],
        [cx, -cz],
        [-cx, cz],
        [cx, cz],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Box size={[0.02, 0.04, 0.02]} position={[0, wheel - 0.02, 0]} material={MAT.metal} />
          <Cyl size={[0.07, 0.03, 0.07]} position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]} material={MAT.body} />
        </group>
      ))}
      <Scatter geometry={UNIT_BOX} material={MAT.cheese} matrices={loads} />
    </group>
  )
}

/** Evaporator unit: housing with guarded fans on the +Z face, fan count follows the width. */
function Cooler({ item, tone }: Props) {
  const { width: w, depth: d } = item
  const h = 0.5
  const n = clampN(Math.round(w / 0.7), 1, 6)
  const fr = Math.min(0.19, (w / n) * 0.36)
  const face = d / 2
  return (
    <group>
      <Box size={[w, h, d]} position={[0, h / 2, 0]} material={MAT.shell} tone={tone} />
      <Box size={[w, 0.03, d]} position={[0, 0.015, 0]} material={MAT.metal} />
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[-w / 2 + (w / n) * (i + 0.5), h * 0.58, face + 0.008]}>
          <mesh geometry={TORUS_GEO} material={MAT.metal} scale={fr / 0.17} />
          <Cyl size={[fr * 0.35, 0.02, fr * 0.35]} rotation={[Math.PI / 2, 0, 0]} material={MAT.body} />
          {[0, 1, 2, 3].map((k) => (
            <Box key={k} size={[0.004, fr * 1.9, 0.004]} rotation={[0, 0, (k * Math.PI) / 4]} material={MAT.metal} />
          ))}
        </group>
      ))}
      {[0, 1, 2].map((k) => (
        <Box
          key={k}
          size={[w * 0.9, 0.014, 0.03]}
          position={[0, 0.06 + k * 0.035, face + 0.004]}
          rotation={[0.5, 0, 0]}
          material={MAT.louver}
        />
      ))}
    </group>
  )
}

/** Wall-type extractor: square housing, guarded fan on the +Z face, motor behind. */
function Extractor({ tone }: Props) {
  const s = 0.6
  const face = 0.175
  return (
    <group>
      <Box size={[s, s, 0.35]} position={[0, s / 2, 0]} material={MAT.shell} tone={tone} />
      <Cyl size={[0.5, 0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, s / 2, face + 0.005]} material={MAT.body} />
      <group position={[0, s / 2, face + 0.02]}>
        <mesh geometry={TORUS_GEO} material={MAT.metal} scale={1.4} />
        <mesh geometry={TORUS_MID_GEO} material={MAT.metal} scale={1.4} />
        {Array.from({ length: FAN_SPOKES }, (_, i) => (
          <Box key={i} size={[0.005, 0.47, 0.005]} rotation={[0, 0, (i * Math.PI) / FAN_SPOKES]} material={MAT.metal} />
        ))}
        <Cyl size={[0.08, 0.05, 0.08]} rotation={[Math.PI / 2, 0, 0]} material={MAT.shell} tone={tone} />
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i} rotation={[0, 0, (-i * Math.PI * 2) / 5]}>
            <Box size={[0.1, 0.18, 0.006]} position={[0, 0.12, -0.012]} rotation={[0, 0.4, 0]} material={MAT.shell} />
          </group>
        ))}
      </group>
      <Cyl size={[0.16, 0.12, 0.16]} rotation={[Math.PI / 2, 0, 0]} position={[0, s / 2, -face - 0.06]} material={MAT.body} />
    </group>
  )
}

/** Convector heater on feet, vertical fins on the front. */
function Heater({ item, tone }: Props) {
  const { width: w, depth: d } = item
  const leg = 0.1
  const h = 0.5
  const body = d * 0.45
  const fins = clampN(Math.floor(w / 0.045), 4, 24)
  return (
    <group>
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.04, leg, d]} position={[s * (w / 2 - 0.06), leg / 2, 0]} material={MAT.metal} />
      ))}
      <Box size={[w, h, body]} position={[0, leg + h / 2, 0]} material={MAT.shell} tone={tone} />
      {Array.from({ length: fins }, (_, i) => (
        <Box
          key={i}
          size={[0.012, h * 0.82, 0.03]}
          position={[-w / 2 + (w / fins) * (i + 0.5), leg + h / 2, body / 2 + 0.015]}
          material={MAT.metal}
        />
      ))}
      <Box size={[w * 0.9, 0.012, body * 0.8]} position={[0, leg + h + 0.006, 0]} material={MAT.louver} />
      <Box size={[0.03, 0.012, 0.006]} position={[w * 0.4, leg + h * 0.92, body / 2 + 0.032]} material={MAT.led} />
    </group>
  )
}

/** Dehumidifier cabinet: top grille, water-tank seam, status LED, casters. */
function Dehumidifier({ item, tone }: Props) {
  const { width: w, depth: d } = item
  const h = 0.8
  const base = 0.05
  return (
    <group>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <Cyl key={i} size={[0.05, 0.04, 0.05]} position={[sx * (w / 2 - 0.05), 0.02, sz * (d / 2 - 0.05)]} material={MAT.body} />
      ))}
      <Box size={[w, h - base, d]} position={[0, base + (h - base) / 2, 0]} material={MAT.shell} tone={tone} />
      <Box size={[w * 1.01, 0.012, d * 1.01]} position={[0, base + 0.28, 0]} material={MAT.metal} />
      <Box size={[w * 0.8, 0.22, 0.008]} position={[0, base + 0.15, d / 2 + 0.004]} material={MAT.body} />
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={i} size={[w * 0.85, 0.01, 0.02]} position={[0, h + 0.005, -d * 0.35 + (i * d * 0.7) / 5]} material={MAT.louver} />
      ))}
      <Box size={[0.03, 0.012, 0.006]} position={[w * 0.3, h - 0.08, d / 2 + 0.004]} material={MAT.led} />
    </group>
  )
}

// ── sensors (all kinds) ──────────────────────────────────────────

/** Procedural stand-in while the sensor mesh loads. */
function SensorPuck({ tone }: { tone: Tone }) {
  return <Box size={[0.06, SENSOR_HEIGHT, 0.06]} position={[0, SENSOR_HEIGHT / 2, 0]} material={MAT.shell} tone={tone} />
}

function Sensor({ item, tone, top }: Props) {
  const y = item.y ?? 0
  const kind = item.sensorKind ?? 'air_temp_humidity'
  // hung from the ceiling (or a silo's roof) on its cable; one standing on the
  // roof, like the outdoor sensor, is already at the top and has none
  const up = top - y - SENSOR_HEIGHT
  const wire = useMemo(() => (y > 0.05 && up > 0.02 ? [0, SENSOR_HEIGHT, 0, 0, SENSOR_HEIGHT + up, 0] : []), [y, up])
  return (
    <group>
      <Suspense fallback={<SensorPuck tone={tone} />}>
        <SensorBody tone={tone} />
      </Suspense>
      {/* kind identity: an emissive ring at the base */}
      <Cyl size={[0.075, 0.012, 0.075]} position={[0, 0.006, 0]} material={SENSOR_MAT[kind]} />
      {wire.length > 0 && <Lines points={wire} material={LINE.wire} />}
      {/* generous invisible hit volume: a slim sensor is hard to grab */}
      <mesh geometry={HIT_GEO} material={MAT.hit} scale={0.5} position={[0, SENSOR_HEIGHT / 2, 0]} />
    </group>
  )
}

export default function ItemModel(p: Props) {
  switch (p.item.type) {
    case 'rack':
      return <Rack {...p} />
    case 'table':
      return <Table {...p} />
    case 'light':
      return <Light {...p} />
    case 'climate':
      return <Climate {...p} />
    case 'fan':
      return <Fan {...p} />
    case 'humidifier':
      return <Humidifier {...p} />
    case 'aerator':
      return <Aerator {...p} />
    case 'cheese_rack':
      return <CheeseRack {...p} />
    case 'hanger':
      return <Hanger {...p} />
    case 'pallet':
      return <Pallet {...p} />
    case 'trolley':
      return <Trolley {...p} />
    case 'cooler':
      return <Cooler {...p} />
    case 'heater':
      return <Heater {...p} />
    case 'dehumidifier':
      return <Dehumidifier {...p} />
    case 'extractor':
      return <Extractor {...p} />
    case 'sensor':
      return <Sensor {...p} />
  }
}
