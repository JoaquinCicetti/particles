import { useMemo } from 'react'
import { bodyHeight } from '../model/geometry'
import type { Item, Room } from '../model/schema'
import {
  CONE_GEO,
  HIT_GEO,
  LINE,
  MAT,
  MIST_GEO,
  SENSOR_MAT,
  TORUS_GEO,
  TORUS_MID_GEO,
  noRaycast,
  type Tone,
} from './materials'
import { Box, Cyl, Lines, Plants } from './parts'

/**
 * Procedural low-poly models, built in the item's local frame: origin at the
 * footprint centre on its base (floor, or the mount height for hung items),
 * width along X, depth along Z, the "front" facing +Z.
 */

type Props = { item: Item; room: Room; tone: Tone }

const MAX_PLANTS = 400

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

function Rack({ item, room, tone }: Props) {
  const { width: w, depth: d } = item
  const H = bodyHeight(item, room)
  const tiers = H >= 1.6 ? 3 : H >= 1 ? 2 : 1
  const gap = (H - 0.15) / tiers
  const shelves = useMemo(() => Array.from({ length: tiers }, (_, i) => 0.15 + i * gap), [tiers, gap])
  const spots = useMemo(() => plantSpots(w, d, shelves.map((y) => y + 0.015), 0.26), [w, d, shelves])
  const post = 0.04
  const px = w / 2 - post / 2
  const pz = d / 2 - post / 2
  return (
    <group>
      {[
        [-px, -pz],
        [px, -pz],
        [-px, pz],
        [px, pz],
      ].map(([x, z], i) => (
        <Box key={i} size={[post, H, post]} position={[x, H / 2, z]} material={MAT.metal} tone={tone} />
      ))}
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
          size={[w * 0.9, h * 0.6 / slats * 0.62, 0.012]}
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

function Sensor({ item, room, tone }: Props) {
  const y = item.y ?? 0
  const kind = item.sensorKind ?? 'air_temp_humidity'
  const up = room.height - y - 0.08
  const wire = useMemo(() => (y > 0.05 && up > 0.02 ? [0, 0.08, 0, 0, 0.08 + up, 0] : []), [y, up])
  return (
    <group>
      <Box size={[0.12, 0.07, 0.12]} position={[0, 0.045, 0]} material={MAT.shell} tone={tone} />
      <Cyl size={[0.07, 0.012, 0.07]} position={[0, 0.006, 0]} material={SENSOR_MAT[kind]} />
      <Box size={[0.09, 0.008, 0.02]} position={[0, 0.06, 0.061]} material={SENSOR_MAT[kind]} />
      {wire.length > 0 && <Lines points={wire} material={LINE.wire} />}
      {/* generous invisible hit volume: a 12 cm puck is hard to grab */}
      <mesh geometry={HIT_GEO} material={MAT.hit} scale={0.5} position={[0, 0.05, 0]} />
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
    case 'sensor':
      return <Sensor {...p} />
  }
}
