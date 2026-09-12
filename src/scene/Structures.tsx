import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SILOS, ELEVATOR, WAREHOUSE, SENSOR_POINTS, BOARD, BOARD_FRONT, GLANDS, SKY } from './particles/curves'
import { sampleSvgPoints } from './particles/svgSampler'
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
  pushLine(out, V(pos.x, h + r * 0.2, pos.z), V(ELEVATOR.pos.x, ELEVATOR.height - 1.2, ELEVATOR.pos.z))
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
function buildHydroInterior(wh: typeof WAREHOUSE, grow: number[]) {
  const out: number[] = []
  const { pos, w, d } = wh
  const rackRows = 5
  const shelves = 5
  const zr0 = pos.z - d / 2 + 0.6
  const zr1 = pos.z + d / 2 - 0.6
  const topY = wh.wall * 0.95
  const rackX: number[] = []
  for (let r = 0; r < rackRows; r++) {
    const x = pos.x - w / 2 + w * ((r + 0.6) / (rackRows + 0.2))
    rackX.push(x)
    // vertical posts at both ends of the rack
    pushLine(out, V(x, 0, zr0), V(x, topY, zr0))
    pushLine(out, V(x, 0, zr1), V(x, topY, zr1))
    for (let s = 1; s <= shelves; s++) {
      const y = (topY * s) / shelves
      // tray rails (two close lines) running the rack length
      pushLine(out, V(x - 0.14, y, zr0), V(x - 0.14, y, zr1))
      pushLine(out, V(x + 0.14, y, zr0), V(x + 0.14, y, zr1))
      // dense grow nodes (plants) along the tray — bright so it reads
      const n = 12
      for (let i = 0; i < n; i++) {
        const z = zr0 + (zr1 - zr0) * (i / (n - 1))
        grow.push(x - 0.14, y + 0.08, z)
        grow.push(x + 0.14, y + 0.08, z)
      }
    }
    // vertical nutrient feed pipe at the front of each rack
    pushLine(out, V(x + 0.22, 0, zr1), V(x + 0.22, topY, zr1))
  }
  // nutrient header manifolds connecting all racks (front + back)
  pushLine(out, V(rackX[0], 0.12, zr0), V(rackX[rackX.length - 1], 0.12, zr0))
  pushLine(out, V(rackX[0], 0.12, zr1), V(rackX[rackX.length - 1], 0.12, zr1))

  // two A-frame vertical grow towers near the front gable for a clear read
  for (const tx of [pos.x - w * 0.22, pos.x + w * 0.22]) {
    const tz = zr1 - 0.6
    const th = wh.wall * 1.05
    const spread = 0.5
    pushLine(out, V(tx - spread, 0, tz), V(tx, th, tz))
    pushLine(out, V(tx + spread, 0, tz), V(tx, th, tz))
    const n = 9
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const off = spread * (1 - t)
      grow.push(tx - off, th * t, tz)
      grow.push(tx + off, th * t, tz)
    }
  }
  return out
}

// detailed grain-elevator tower: braced lattice legs, leg cross-bracing,
// a head house at the top with a roof, and a discharge spout.
function buildTowerLines(pos: THREE.Vector3, w: number, h: number) {
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

  // translate the whole tower to its world position (x, z)
  for (let i = 0; i < out.length; i += 3) {
    out[i] += pos.x
    out[i + 2] += pos.z
  }
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

/**
 * The Growcast device: an industrial enclosure bolted to the camera-facing wall
 * of the elevator. A plain box with a door, latch and cable glands — common
 * electrical kit, deliberately not a sculpture. The brand mark goes on its door
 * as sampled points (see the logo layer in Structures), so nothing is drawn on
 * the face here.
 */
function buildEnclosureLines(out: number[]) {
  const { w, h, d, cy, wallZ } = BOARD
  const hw = w / 2
  const hh = h / 2
  const z0 = wallZ // against the tower wall
  const z1 = wallZ + d // the door plane
  const x0 = ELEVATOR.pos.x - hw
  const x1 = ELEVATOR.pos.x + hw
  const y0 = cy - hh
  const y1 = cy + hh

  // the box: door frame, back frame, and the four corner returns
  const face = (z: number) => {
    pushLine(out, V(x0, y0, z), V(x1, y0, z))
    pushLine(out, V(x1, y0, z), V(x1, y1, z))
    pushLine(out, V(x1, y1, z), V(x0, y1, z))
    pushLine(out, V(x0, y1, z), V(x0, y0, z))
  }
  face(z0)
  face(z1)
  for (const [x, y] of [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]) {
    pushLine(out, V(x, y, z0), V(x, y, z1))
  }

  // door seam set in from the edge, so it reads as a hinged door not a block
  const i = 0.1
  pushLine(out, V(x0 + i, y0 + i, z1), V(x1 - i, y0 + i, z1))
  pushLine(out, V(x1 - i, y0 + i, z1), V(x1 - i, y1 - i, z1))
  pushLine(out, V(x1 - i, y1 - i, z1), V(x0 + i, y1 - i, z1))
  pushLine(out, V(x0 + i, y1 - i, z1), V(x0 + i, y0 + i, z1))

  // hinges down the left stile, latch on the right
  for (const hy of [y0 + h * 0.2, y1 - h * 0.2]) {
    pushLine(out, V(x0 - 0.05, hy, z1 - 0.06), V(x0 - 0.05, hy + 0.16, z1 - 0.06))
    pushLine(out, V(x0 - 0.05, hy, z1 - 0.06), V(x0 + 0.02, hy, z1 - 0.06))
    pushLine(out, V(x0 - 0.05, hy + 0.16, z1 - 0.06), V(x0 + 0.02, hy + 0.16, z1 - 0.06))
  }
  pushLine(out, V(x1 - 0.02, cy - 0.09, z1 + 0.02), V(x1 + 0.09, cy - 0.09, z1 + 0.02))
  pushLine(out, V(x1 + 0.09, cy - 0.09, z1 + 0.02), V(x1 + 0.09, cy + 0.09, z1 + 0.02))
  pushLine(out, V(x1 + 0.09, cy + 0.09, z1 + 0.02), V(x1 - 0.02, cy + 0.09, z1 + 0.02))

  // wall brackets — two per side, back to the tower face
  for (const bx of [x0 + 0.16, x1 - 0.16]) {
    for (const by of [y1 - 0.1, y0 + 0.1]) {
      pushLine(out, V(bx, by, z0), V(bx, by, z0 - 0.14))
      pushLine(out, V(bx - 0.08, by, z0 - 0.14), V(bx + 0.08, by, z0 - 0.14))
    }
  }

  // cable glands underneath, one per feed, each with a short tail
  for (let g = 0; g < GLANDS; g++) {
    const gx = ELEVATOR.pos.x + w * (-0.34 + (0.68 * g) / (GLANDS - 1))
    const gz = wallZ + d * 0.5
    pushRing(out, gx, y0 - 0.01, gz, 0.07, 10)
    pushRing(out, gx, y0 - 0.09, gz, 0.05, 8)
    pushLine(out, V(gx, y0 - 0.09, gz), V(gx, y0 - 0.26, gz))
  }

  // conduit out of the top, bending back to the tower axis, then the riser the
  // uplink bundle travels along — with ties up its length
  const cz = wallZ + d * 0.5
  pushRing(out, ELEVATOR.pos.x, y1 + 0.01, cz, 0.1, 12)
  const bend = 10
  for (let k = 0; k < bend; k++) {
    const t0 = k / bend
    const t1 = (k + 1) / bend
    const yy = (t: number) => y1 + 1.1 * t
    const zz = (t: number) => cz + (ELEVATOR.pos.z - cz) * Math.pow(t, 0.8)
    pushLine(out, V(ELEVATOR.pos.x, yy(t0), zz(t0)), V(ELEVATOR.pos.x, yy(t1), zz(t1)))
  }
  pushLine(out, V(ELEVATOR.pos.x, y1 + 1.1, ELEVATOR.pos.z), V(ELEVATOR.pos.x, SKY, ELEVATOR.pos.z))
  for (let k = 1; k < 11; k++) {
    const wy = y1 + 1.1 + ((SKY - y1 - 1.1) * k) / 11
    pushRing(out, ELEVATOR.pos.x, wy, ELEVATOR.pos.z, 0.07, 10)
  }
}

function linesGeometry(positions: number[]) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  return geo
}

export default function Structures() {
  const groupRef = useRef<THREE.Group>(null)

  const { lineGeo, shellGeo, growGeo, sensorGeo, gridGeo } = useMemo(() => {
    const random = createRandom(424242)

    const lines: number[] = []
    const shellPts: number[] = []
    const growPts: number[] = []
    for (const s of SILOS) lines.push(...buildSiloLines(s.pos, s.radius, s.height))
    lines.push(...buildTowerLines(ELEVATOR.pos, ELEVATOR.width, ELEVATOR.height))
    lines.push(...buildWarehouseLines(WAREHOUSE))
    lines.push(...buildHydroInterior(WAREHOUSE, growPts)) // rack grow nodes
    buildEnclosureLines(lines) // the Growcast enclosure + its conduit/riser

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
      growGeo: linesGeometry(growPts),
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
    // hydroponic grow nodes — brighter than shells, gently pulsing
    const grow = new THREE.PointsMaterial({
      color: '#e8a85c',
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    // the brand mark on the enclosure door — brighter than the wireframe so it
    // reads as a lit badge when the camera comes to look at it
    const mark = new THREE.PointsMaterial({
      color: '#ffd9a0',
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { line, grid, shell, sensor, grow, mark }
  }, [])

  // the brand mark, sampled from the same logo.svg the finale uses and laid
  // flat on the enclosure door (a hair in front of it, so it never z-fights)
  const [markGeo, setMarkGeo] = useState<THREE.BufferGeometry | null>(null)
  useEffect(() => {
    let alive = true
    sampleSvgPoints('/logo.svg', 1400, {
      worldHeight: BOARD.h * 0.62,
      centerY: BOARD.cy,
      centerX: BOARD_FRONT.x,
      centerZ: BOARD_FRONT.z + 0.012,
      rasterHeight: 420,
      step: 1,
      depth: 0.006,
      seed: 71129,
    })
      .then((pts) => {
        if (!alive) return
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(pts, 3))
        setMarkGeo(g)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
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
    // grow nodes breathe slowly
    materials.grow.opacity = (0.6 + 0.25 * Math.sin(clock.elapsedTime * 1.3 + 1.0)) * fade
    materials.mark.opacity = (0.85 + 0.15 * Math.sin(clock.elapsedTime * 1.8)) * fade
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo} material={materials.line} />
      <lineSegments geometry={gridGeo} material={materials.grid} />
      <points geometry={shellGeo} material={materials.shell} />
      <points geometry={growGeo} material={materials.grow} />
      <points geometry={sensorGeo} material={materials.sensor} />
      {markGeo && <points geometry={markGeo} material={materials.mark} />}
    </group>
  )
}
