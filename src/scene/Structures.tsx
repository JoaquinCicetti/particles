import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SILOS, ELEVATOR, WAREHOUSE, SENSOR_POINTS } from './particles/curves'
import { createRandom } from '../lib/random'
import { scrollState } from '../lib/scroll'
import { smoothstep } from '../lib/math'

/**
 * Holographic farm structures: detailed wireframe grain silos, a gabled
 * warehouse (the main building), and the central grain-elevator tower. No
 * solid surfaces — only lines and luminous points. Bright sensor nodes mark
 * the data sources. Everything fades as the camera dives into the stream.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

function pushLine(out: number[], a: THREE.Vector3, b: THREE.Vector3) {
  out.push(a.x, a.y, a.z, b.x, b.y, b.z)
}

function pushRing(out: number[], cx: number, cy: number, cz: number, r: number, segments = 48) {
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2
    const a1 = ((i + 1) / segments) * Math.PI * 2
    out.push(cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r)
    out.push(cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r)
  }
}

// detailed steel grain bin: corrugated body, ribbed roof, discharge cone,
// foundation, man-door, side ladder, and a conveyor bridge to the tower.
function buildSiloLines(pos: THREE.Vector3, r: number, h: number) {
  const out: number[] = []

  // foundation + base skirt
  pushRing(out, pos.x, 0.04, pos.z, r * 1.08)
  pushRing(out, pos.x, 0.04, pos.z, r * 1.0)

  // corrugated banding up the body
  const bands = 14
  for (let b = 0; b <= bands; b++) pushRing(out, pos.x, (h * b) / bands, pos.z, r, 40)

  // vertical seam staves + conical roof spokes to the apex
  const apex = V(pos.x, h + r * 0.55, pos.z)
  const staves = 18
  for (let i = 0; i < staves; i++) {
    const a = (i / staves) * Math.PI * 2
    const top = V(pos.x + Math.cos(a) * r * 0.95, h, pos.z + Math.sin(a) * r * 0.95)
    pushLine(out, V(pos.x + Math.cos(a) * r, 0, pos.z + Math.sin(a) * r), top)
    pushLine(out, top, apex)
  }

  // eave + roof cap rings + peak vent
  pushRing(out, pos.x, h, pos.z, r * 0.95, 32)
  pushRing(out, pos.x, h + r * 0.3, pos.z, r * 0.44, 24)
  pushRing(out, pos.x, h + r * 0.55, pos.z, r * 0.16, 16)

  // interior discharge cone (hopper) hinted under the eave
  const coneTipY = Math.max(0.3, h * 0.16)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    pushLine(out, V(pos.x + Math.cos(a) * r * 0.9, h * 0.34, pos.z + Math.sin(a) * r * 0.9), V(pos.x, coneTipY, pos.z))
  }

  // man-door on the -z face
  const dw = 0.32
  const dh = 1.0
  pushLine(out, V(pos.x - dw, 0, pos.z - r), V(pos.x - dw, dh, pos.z - r))
  pushLine(out, V(pos.x + dw, 0, pos.z - r), V(pos.x + dw, dh, pos.z - r))
  pushLine(out, V(pos.x - dw, dh, pos.z - r), V(pos.x + dw, dh, pos.z - r))

  // exterior ladder on the +x face
  const lx = pos.x + r
  const g = 0.16
  pushLine(out, V(lx, 0, pos.z - g), V(lx, h, pos.z - g))
  pushLine(out, V(lx, 0, pos.z + g), V(lx, h, pos.z + g))
  const rungs = Math.floor(h / 0.45)
  for (let i = 1; i < rungs; i++) {
    const y = (h / rungs) * i
    pushLine(out, V(lx, y, pos.z - g), V(lx, y, pos.z + g))
  }

  // conveyor bridge from the silo peak toward the tower head
  pushLine(out, V(pos.x, h + r * 0.2, pos.z), V(0, ELEVATOR.height - 1.2, 0))
  return out
}

// detailed gabled warehouse: footprint, panelled walls, ribbed gable roof,
// a big sliding door on the camera-facing gable, eave trim and roof vents.
function buildWarehouseLines(wh: typeof WAREHOUSE) {
  const out: number[] = []
  const { pos, w, d, wall, ridge } = wh
  const hw = w / 2
  const hd = d / 2
  const x0 = pos.x - hw
  const x1 = pos.x + hw
  const z0 = pos.z - hd
  const z1 = pos.z + hd // camera-facing gable

  // footprint
  pushLine(out, V(x0, 0, z0), V(x1, 0, z0))
  pushLine(out, V(x1, 0, z0), V(x1, 0, z1))
  pushLine(out, V(x1, 0, z1), V(x0, 0, z1))
  pushLine(out, V(x0, 0, z1), V(x0, 0, z0))

  // eaves + ridge (run along z)
  pushLine(out, V(x0, wall, z0), V(x0, wall, z1))
  pushLine(out, V(x1, wall, z0), V(x1, wall, z1))
  pushLine(out, V(pos.x, ridge, z0), V(pos.x, ridge, z1))

  // wall panel seams + roof rafters along the length
  const ribs = 10
  for (let i = 0; i <= ribs; i++) {
    const z = z0 + (d * i) / ribs
    pushLine(out, V(x0, 0, z), V(x0, wall, z))
    pushLine(out, V(x1, 0, z), V(x1, wall, z))
    pushLine(out, V(x0, wall, z), V(pos.x, ridge, z))
    pushLine(out, V(x1, wall, z), V(pos.x, ridge, z))
  }

  // gable ends (both): eave line + roof slopes already covered; add the wall top
  for (const z of [z0, z1]) {
    pushLine(out, V(x0, wall, z), V(x1, wall, z))
  }

  // big sliding door on the front gable (z1)
  const ddw = w * 0.32
  const ddh = wall * 0.82
  pushLine(out, V(pos.x - ddw, 0, z1), V(pos.x - ddw, ddh, z1))
  pushLine(out, V(pos.x + ddw, 0, z1), V(pos.x + ddw, ddh, z1))
  pushLine(out, V(pos.x - ddw, ddh, z1), V(pos.x + ddw, ddh, z1))
  pushLine(out, V(pos.x, 0, z1), V(pos.x, ddh, z1)) // center split
  // side windows on the +x wall
  for (let i = 0; i < 3; i++) {
    const z = z0 + d * (0.28 + i * 0.22)
    const wy0 = wall * 0.45
    const wy1 = wall * 0.78
    pushLine(out, V(x1, wy0, z - 0.4), V(x1, wy0, z + 0.4))
    pushLine(out, V(x1, wy1, z - 0.4), V(x1, wy1, z + 0.4))
    pushLine(out, V(x1, wy0, z - 0.4), V(x1, wy1, z - 0.4))
    pushLine(out, V(x1, wy0, z + 0.4), V(x1, wy1, z + 0.4))
  }
  // ridge vents
  for (let i = 0; i < 3; i++) {
    const z = z0 + d * (0.3 + i * 0.2)
    pushRing(out, pos.x, ridge + 0.08, z, 0.22, 4)
  }
  return out
}

// hydroponic interior: rows of stacked grow racks (trays running along z) with
// vertical posts and nutrient channels. Tray nodes (plants/sensors) are pushed
// into `nodes` so they glow as points.
function buildHydroInterior(wh: typeof WAREHOUSE, nodes: number[]) {
  const out: number[] = []
  const { pos, w, d } = wh
  const rackRows = 4
  const shelves = 4
  const zr0 = pos.z - d / 2 + 0.7
  const zr1 = pos.z + d / 2 - 0.7
  const topY = wh.wall * 0.86
  for (let r = 0; r < rackRows; r++) {
    const x = pos.x - w / 2 + w * ((r + 0.7) / (rackRows + 0.4))
    // vertical posts at both ends of the rack
    pushLine(out, V(x, 0, zr0), V(x, topY, zr0))
    pushLine(out, V(x, 0, zr1), V(x, topY, zr1))
    for (let s = 1; s <= shelves; s++) {
      const y = (topY * s) / shelves
      // tray rails (two close lines) running the rack length
      pushLine(out, V(x - 0.12, y, zr0), V(x - 0.12, y, zr1))
      pushLine(out, V(x + 0.12, y, zr0), V(x + 0.12, y, zr1))
      // plant / sensor nodes along the tray
      const n = 7
      for (let i = 0; i < n; i++) {
        const z = zr0 + (zr1 - zr0) * (i / (n - 1))
        nodes.push(x, y + 0.06, z)
      }
    }
  }
  return out
}

// detailed grain-elevator tower: braced lattice legs, leg cross-bracing,
// a head house at the top with a roof, and a discharge spout.
function buildTowerLines(w: number, h: number) {
  const out: number[] = []
  const hw = w / 2
  const corners: [number, number][] = [
    [-hw, -hw],
    [hw, -hw],
    [hw, hw],
    [-hw, hw],
  ]
  // legs
  for (const [x, z] of corners) pushLine(out, V(x, 0, z), V(x, h, z))

  const levels = 9
  for (let l = 0; l <= levels; l++) {
    const y = (h / levels) * l
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = corners[i]
      const [x1, z1] = corners[(i + 1) % 4]
      pushLine(out, V(x0, y, z0), V(x1, y, z1))
    }
  }
  // diagonal cross-bracing on each face, alternating per level
  for (let l = 0; l < levels; l++) {
    const y0 = (h / levels) * l
    const y1 = (h / levels) * (l + 1)
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = corners[i]
      const [x1, z1] = corners[(i + 1) % 4]
      if (l % 2 === 0) pushLine(out, V(x0, y0, z0), V(x1, y1, z1))
      else pushLine(out, V(x1, y0, z1), V(x0, y1, z0))
    }
  }
  // inner belt guides
  pushLine(out, V(-0.18, 0, 0), V(-0.18, h, 0))
  pushLine(out, V(0.18, 0, 0), V(0.18, h, 0))

  // head house (boxy enclosure) at the top
  const hh = 2.0
  const hwH = hw * 1.45
  const hc: [number, number][] = [
    [-hwH, -hwH],
    [hwH, -hwH],
    [hwH, hwH],
    [-hwH, hwH],
  ]
  for (const [x, z] of hc) pushLine(out, V(x, h, z), V(x, h + hh, z))
  for (let i = 0; i < 4; i++) {
    const [x0, z0] = hc[i]
    const [x1, z1] = hc[(i + 1) % 4]
    pushLine(out, V(x0, h, z0), V(x1, h, z1))
    pushLine(out, V(x0, h + hh, z0), V(x1, h + hh, z1))
  }
  // head-house roof apex
  const apex = V(0, h + hh + 0.9, 0)
  for (const [x, z] of hc) pushLine(out, V(x, h + hh, z), apex)

  // discharge spout angling down off the head house
  pushLine(out, V(hwH, h + hh * 0.6, 0), V(hwH + 2.4, h + hh * 0.1, 0))
  pushLine(out, V(hwH, h + hh * 0.6, 0.25), V(hwH + 2.4, h + hh * 0.1, 0.25))
  return out
}

// stylized wireframe conifer: stacked triangular tiers + trunk
function buildTreeLines(out: number[], cx: number, cz: number, scale: number) {
  const trunkH = 0.5 * scale
  pushLine(out, V(cx, 0, cz), V(cx, trunkH, cz))
  for (let t = 0; t < 3; t++) {
    const baseY = trunkH + t * 1.0 * scale
    const topY = baseY + 1.25 * scale
    const rad = (0.95 - t * 0.26) * scale
    const seg = 7
    let prev: THREE.Vector3 | null = null
    const first = new THREE.Vector3()
    const apex = V(cx, topY, cz)
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      const p = V(cx + Math.cos(a) * rad, baseY, cz + Math.sin(a) * rad)
      if (i === 0) first.copy(p)
      if (prev) pushLine(out, prev, p)
      pushLine(out, p, apex)
      prev = p
    }
    if (prev) pushLine(out, prev, first)
  }
}

function linesGeometry(positions: number[]) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  return geo
}

export default function Structures() {
  const groupRef = useRef<THREE.Group>(null)

  const { lineGeo, shellGeo, sensorGeo, gridGeo } = useMemo(() => {
    const random = createRandom(424242)

    const lines: number[] = []
    const shellPts: number[] = []
    for (const s of SILOS) lines.push(...buildSiloLines(s.pos, s.radius, s.height))
    lines.push(...buildTowerLines(ELEVATOR.width, ELEVATOR.height))
    lines.push(...buildWarehouseLines(WAREHOUSE))
    lines.push(...buildHydroInterior(WAREHOUSE, shellPts)) // rack tray nodes → glow

    // shimmering particle shells on silo + warehouse surfaces
    for (const s of SILOS) {
      for (let i = 0; i < 2400; i++) {
        const a = random() * Math.PI * 2
        const y = random() * s.height
        const r = s.radius + (random() - 0.5) * 0.05
        shellPts.push(s.pos.x + Math.cos(a) * r, y, s.pos.z + Math.sin(a) * r)
      }
    }
    // warehouse roof shimmer
    {
      const { pos, w, d, wall, ridge } = WAREHOUSE
      for (let i = 0; i < 2600; i++) {
        const side = random() < 0.5 ? -1 : 1
        const t = random()
        const z = pos.z - d / 2 + d * random()
        const x = pos.x + side * (w / 2) * (1 - t)
        const y = wall + (ridge - wall) * t
        shellPts.push(x, y, z)
      }
    }

    // sensor nodes — the data sources
    const sensors: number[] = []
    for (const s of SENSOR_POINTS) sensors.push(s.x, s.y, s.z)

    // background conifers on the far perimeter
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + random() * 0.18
      const rr = 20 + random() * 7
      buildTreeLines(lines, Math.cos(a) * rr, Math.sin(a) * rr, 0.8 + random() * 0.7)
    }

    // polar data-floor + far horizon rings
    const grid: number[] = []
    for (const r of [3, 6, 9, 12, 15, 18]) pushRing(grid, 0, 0.01, 0, r, 96)
    for (const r of [26, 34, 44]) pushRing(grid, 0, 0.01, 0, r, 120)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      pushLine(grid, V(Math.cos(a) * 2, 0.01, Math.sin(a) * 2), V(Math.cos(a) * 18, 0.01, Math.sin(a) * 18))
    }

    // field furrows (crop rows) in the open foreground — sells a real farm
    for (let i = -15; i <= 15; i++) {
      const x = i * 1.15
      const wobble = (random() - 0.5) * 0.1
      pushLine(grid, V(x, 0.015, 8.5), V(x + wobble, 0.015, 20))
    }

    return {
      lineGeo: linesGeometry(lines),
      shellGeo: linesGeometry(shellPts),
      sensorGeo: linesGeometry(sensors),
      gridGeo: linesGeometry(grid),
    }
  }, [])

  const materials = useMemo(() => {
    const line = new THREE.LineBasicMaterial({
      color: '#b97a3e',
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const grid = new THREE.LineBasicMaterial({
      color: '#8a5226',
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const shell = new THREE.PointsMaterial({
      color: '#d99550',
      size: 0.026,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sensor = new THREE.PointsMaterial({
      color: '#ffe6bf',
      size: 0.28,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { line, grid, shell, sensor }
  }, [])

  useFrame(({ clock }) => {
    const fade = 1 - smoothstep(0.3, 0.44, scrollState.smooth)
    const group = groupRef.current
    if (group) group.visible = fade > 0.01
    materials.line.opacity = 0.6 * fade
    materials.grid.opacity = 0.16 * fade
    materials.shell.opacity = 0.42 * fade
    // sensors pulse like live data sources
    materials.sensor.opacity = (0.7 + 0.3 * Math.sin(clock.elapsedTime * 2.6)) * fade
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo} material={materials.line} />
      <lineSegments geometry={gridGeo} material={materials.grid} />
      <points geometry={shellGeo} material={materials.shell} />
      <points geometry={sensorGeo} material={materials.sensor} />
    </group>
  )
}
