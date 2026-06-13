import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SILOS, ELEVATOR } from './particles/curves'
import { createRandom } from '../lib/random'
import { scrollState } from '../lib/scroll'
import { smoothstep } from '../lib/math'

/**
 * Holographic site structures: wireframe silos with particle shells, the
 * central elevator frame, and a polar data-floor. No solid surfaces — only
 * lines and luminous points. Everything fades out as the camera dives into
 * the elevator stream.
 */

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

function buildSiloLines(pos: THREE.Vector3, r: number, h: number) {
  const out: number[] = []

  // base skirt + corrugated banding up the body (steel-bin rings)
  pushRing(out, pos.x, pos.y, pos.z, r * 1.05)
  const bands = 13
  for (let b = 0; b <= bands; b++) {
    const f = b / bands
    pushRing(out, pos.x, pos.y + h * f, pos.z, r)
  }

  // vertical seam staves + conical roof spokes to the apex
  const apex = new THREE.Vector3(pos.x, pos.y + h + r * 0.55, pos.z)
  const staves = 16
  for (let i = 0; i < staves; i++) {
    const a = (i / staves) * Math.PI * 2
    const top = new THREE.Vector3(pos.x + Math.cos(a) * r * 0.95, pos.y + h, pos.z + Math.sin(a) * r * 0.95)
    const bottom = new THREE.Vector3(pos.x + Math.cos(a) * r, pos.y, pos.z + Math.sin(a) * r)
    pushLine(out, bottom, top)
    pushLine(out, top, apex)
  }

  // roof eave + cap rings, and a vent cap at the peak
  pushRing(out, pos.x, pos.y + h, pos.z, r * 0.95, 32)
  pushRing(out, pos.x, pos.y + h + r * 0.32, pos.z, r * 0.42, 24)
  pushRing(out, pos.x, pos.y + h + r * 0.55, pos.z, r * 0.16, 16)

  // exterior maintenance ladder (two rails + rungs) on the +x face
  const lx = pos.x + r
  const lz = pos.z
  const railGap = 0.16
  pushLine(out, new THREE.Vector3(lx, pos.y, lz - railGap), new THREE.Vector3(lx, pos.y + h, lz - railGap))
  pushLine(out, new THREE.Vector3(lx, pos.y, lz + railGap), new THREE.Vector3(lx, pos.y + h, lz + railGap))
  const rungs = Math.floor(h / 0.45)
  for (let i = 1; i < rungs; i++) {
    const y = pos.y + (h / rungs) * i
    pushLine(out, new THREE.Vector3(lx, y, lz - railGap), new THREE.Vector3(lx, y, lz + railGap))
  }
  return out
}

// stylized wireframe conifer: stacked triangular tiers + trunk
function buildTreeLines(out: number[], cx: number, cz: number, scale: number) {
  const trunkH = 0.5 * scale
  pushLine(out, new THREE.Vector3(cx, 0, cz), new THREE.Vector3(cx, trunkH, cz))
  const tiers = 3
  for (let t = 0; t < tiers; t++) {
    const baseY = trunkH + (t * 1.0) * scale
    const topY = baseY + 1.25 * scale
    const rad = (0.95 - t * 0.26) * scale
    const seg = 7
    let prev: THREE.Vector3 | null = null
    const first = new THREE.Vector3()
    const apex = new THREE.Vector3(cx, topY, cz)
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      const p = new THREE.Vector3(cx + Math.cos(a) * rad, baseY, cz + Math.sin(a) * rad)
      if (i === 0) first.copy(p)
      if (prev) pushLine(out, prev, p)
      pushLine(out, p, apex) // skirt spoke
      prev = p
    }
    if (prev) pushLine(out, prev, first)
  }
}

function buildElevatorLines(w: number, h: number) {
  const out: number[] = []
  const hw = w / 2
  const corners = [
    [-hw, -hw],
    [hw, -hw],
    [hw, hw],
    [-hw, hw],
  ]
  for (const [x, z] of corners) {
    pushLine(out, new THREE.Vector3(x, 0, z), new THREE.Vector3(x, h, z))
  }
  const levels = 8
  for (let l = 0; l <= levels; l++) {
    const y = (h / levels) * l
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = corners[i]
      const [x1, z1] = corners[(i + 1) % 4]
      pushLine(out, new THREE.Vector3(x0, y, z0), new THREE.Vector3(x1, y, z1))
    }
  }
  // inner belt guides
  pushLine(out, new THREE.Vector3(-0.18, 0, 0), new THREE.Vector3(-0.18, h, 0))
  pushLine(out, new THREE.Vector3(0.18, 0, 0), new THREE.Vector3(0.18, h, 0))
  // crown
  const apex = new THREE.Vector3(0, h + 1, 0)
  for (const [x, z] of corners) {
    pushLine(out, new THREE.Vector3(x, h, z), apex)
  }
  return out
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
    for (const s of SILOS) lines.push(...buildSiloLines(s.pos, s.radius, s.height))
    lines.push(...buildElevatorLines(ELEVATOR.width, ELEVATOR.height))

    // shimmering particle shells on silo surfaces
    const shellPts: number[] = []
    for (const s of SILOS) {
      for (let i = 0; i < 2200; i++) {
        const a = random() * Math.PI * 2
        const y = random() * s.height
        const r = s.radius + (random() - 0.5) * 0.05
        shellPts.push(s.pos.x + Math.cos(a) * r, s.pos.y + y, s.pos.z + Math.sin(a) * r)
      }
    }

    // sensor nodes (kept separate for a brighter, pulsing material)
    const sensors: number[] = []
    for (const s of SILOS) sensors.push(s.pos.x, s.pos.y + s.height + s.radius * 0.5, s.pos.z)
    sensors.push(0, ELEVATOR.height + 1, 0, 0, 8, 0.05, -8.5, 0.45, 5, 9.5, 2.4, 1.5, -9, 1.2, -6, -2, 3, 1.4)

    // background scenery: a ring of stylized conifers on the far perimeter
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + random() * 0.18
      const rr = 19 + random() * 7
      buildTreeLines(lines, Math.cos(a) * rr, Math.sin(a) * rr, 0.8 + random() * 0.7)
    }

    // polar data-floor + far horizon rings
    const grid: number[] = []
    for (const r of [3, 6, 9, 12, 15, 18]) pushRing(grid, 0, 0.01, 0, r, 96)
    for (const r of [26, 34, 44]) pushRing(grid, 0, 0.01, 0, r, 120)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      pushLine(
        grid,
        new THREE.Vector3(Math.cos(a) * 2, 0.01, Math.sin(a) * 2),
        new THREE.Vector3(Math.cos(a) * 18, 0.01, Math.sin(a) * 18),
      )
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
      opacity: 0.55,
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
      size: 0.028,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sensor = new THREE.PointsMaterial({
      color: '#ffd9a0',
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { line, grid, shell, sensor }
  }, [])

  useFrame(({ clock }) => {
    const fade = 1 - smoothstep(0.28, 0.42, scrollState.smooth)
    const group = groupRef.current
    if (group) group.visible = fade > 0.01
    materials.line.opacity = 0.55 * fade
    materials.grid.opacity = 0.16 * fade
    materials.shell.opacity = 0.5 * fade
    materials.sensor.opacity = (0.65 + 0.35 * Math.sin(clock.elapsedTime * 2.2)) * fade
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
