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
  for (const f of [0.02, 0.3, 0.55, 0.8, 1]) {
    pushRing(out, pos.x, pos.y + h * f, pos.z, f === 1 ? r * 0.94 : r)
  }
  const apex = new THREE.Vector3(pos.x, pos.y + h + r * 0.5, pos.z)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const top = new THREE.Vector3(pos.x + Math.cos(a) * r * 0.94, pos.y + h, pos.z + Math.sin(a) * r * 0.94)
    const bottom = new THREE.Vector3(pos.x + Math.cos(a) * r, pos.y, pos.z + Math.sin(a) * r)
    pushLine(out, bottom, top)
    pushLine(out, top, apex)
  }
  return out
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

    // polar data-floor
    const grid: number[] = []
    for (const r of [3, 6, 9, 12, 15, 18]) pushRing(grid, 0, 0.01, 0, r, 96)
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
