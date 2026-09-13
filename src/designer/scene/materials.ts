import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SENSOR_SPECS } from '../model/catalog'
import { SENSOR_KINDS, type SensorKind } from '../model/schema'

/**
 * Shared geometry + materials for the "dark CAD + copper" look: matte
 * near-black solids, copper edge lines, emissive LEDs. Unit geometries are
 * scaled per part so edges are computed once.
 */

export const noRaycast = () => {}

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1)
export const UNIT_BOX_EDGES = new THREE.EdgesGeometry(UNIT_BOX)
export const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 28)
export const UNIT_CYL_EDGES = new THREE.EdgesGeometry(UNIT_CYL, 40)
export const POT_GEO = new THREE.CylinderGeometry(0.5, 0.36, 1, 8)
export const TORUS_GEO = new THREE.TorusGeometry(0.17, 0.012, 8, 40)
/** Inner cage ring, so the fan reads as a guarded appliance and not a propeller. */
export const TORUS_MID_GEO = new THREE.TorusGeometry(0.112, 0.008, 6, 28)
export const HIT_GEO = new THREE.SphereGeometry(0.5, 8, 6)
export const PLANE_GEO = new THREE.PlaneGeometry(1, 1)

/**
 * Low-poly plant: an upright centre spike with leaves fanning out from the
 * base. Merged once and instanced, so a full rack costs a single draw call.
 * Normalized to unit radius about its centre, like the blob it replaced.
 */
export const PLANT_GEO = (() => {
  const parts: THREE.BufferGeometry[] = []
  const spike = new THREE.ConeGeometry(0.4, 1.5, 5)
  spike.translate(0, 0.22, 0)
  parts.push(spike)
  const LEAVES = 6
  for (let i = 0; i < LEAVES; i++) {
    const a = (i / LEAVES) * Math.PI * 2 + 0.4
    const leaf = new THREE.ConeGeometry(0.28, 1.05, 4)
    leaf.translate(0, 0.52, 0) // pivot at the base, tip up
    leaf.rotateZ(0.9) // lean outwards
    leaf.rotateY(a) // then fan around the stem
    leaf.translate(Math.cos(a) * 0.26, -0.3, -Math.sin(a) * 0.26)
    parts.push(leaf)
  }
  const g = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  if (!g) return new THREE.IcosahedronGeometry(1, 0)
  g.center()
  g.computeBoundingSphere()
  const r = g.boundingSphere?.radius ?? 1
  g.scale(1 / r, 1 / r, 1 / r)
  g.computeVertexNormals()
  return g
})()

/**
 * Vertical falloff baked into vertex colours: with additive blending a black
 * vertex adds nothing, so the volume dissolves without a shader or a texture.
 * `warm` tints the light cone, the cool variant the humidifier plume.
 */
function fade(g: THREE.BufferGeometry, tint: [number, number, number], bright: 'top' | 'bottom') {
  const pos = g.attributes.position
  const col = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const h = THREE.MathUtils.clamp(pos.getY(i) + 0.5, 0, 1)
    const f = (bright === 'top' ? h : 1 - h) ** 2
    col[i * 3] = f * tint[0]
    col[i * 3 + 1] = f * tint[1]
    col[i * 3 + 2] = f * tint[2]
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

/** Square light cone (side 1 at the top) widening towards the floor. */
export const CONE_GEO = (() => {
  const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2 * 1.45, 1, 4, 8, true)
  g.rotateY(Math.PI / 4)
  return fade(g, [0.79, 0.85, 0.43], 'top')
})()

/** Humidifier plume: tight at the nozzle, dissolving as it rises. */
export const MIST_GEO = (() => {
  const g = new THREE.CylinderGeometry(0.5, 0.14, 1, 10, 8, true)
  return fade(g, [0.78, 0.86, 1], 'bottom')
})()

export const MAT = {
  floor: new THREE.MeshStandardMaterial({ color: '#17171a', roughness: 1, metalness: 0 }),
  wall: new THREE.MeshStandardMaterial({ color: '#202024', roughness: 1, metalness: 0 }),
  body: new THREE.MeshStandardMaterial({ color: '#26262b', roughness: 0.8, metalness: 0.2 }),
  shell: new THREE.MeshStandardMaterial({ color: '#313138', roughness: 0.6, metalness: 0.1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#3f3f47', roughness: 0.45, metalness: 0.6 }),
  tray: new THREE.MeshStandardMaterial({ color: '#2b2b31', roughness: 0.7 }),
  water: new THREE.MeshStandardMaterial({ color: '#1b2a30', roughness: 0.25, metalness: 0.2 }),
  plant: new THREE.MeshStandardMaterial({ color: '#6d8a42', roughness: 0.85, flatShading: true }),
  pot: new THREE.MeshStandardMaterial({ color: '#1f1f23', roughness: 0.9 }),
  louver: new THREE.MeshStandardMaterial({ color: '#2e2e34', roughness: 0.5, metalness: 0.35 }),
  led: new THREE.MeshStandardMaterial({ color: '#f4ffd2', emissive: '#e2f09c', emissiveIntensity: 1.5 }),
  // additive + DoubleSide means every face adds twice: keep alpha very low or
  // the volume turns into a grey wall that hides whatever is behind it
  cone: new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  }),
  mist: new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  }),
  hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  footprint: new THREE.MeshBasicMaterial({ color: '#cad86e', transparent: true, opacity: 0.12, depthWrite: false }),
}

export type Tone = 'idle' | 'hover' | 'selected'

export const EDGE: Record<Tone, THREE.LineBasicMaterial> = {
  idle: new THREE.LineBasicMaterial({ color: '#cad86e', transparent: true, opacity: 0.5 }),
  hover: new THREE.LineBasicMaterial({ color: '#dcea8f', transparent: true, opacity: 0.95 }),
  selected: new THREE.LineBasicMaterial({ color: '#eef7b4' }),
}

export const LINE = {
  room: new THREE.LineBasicMaterial({ color: '#cad86e', transparent: true, opacity: 0.8 }),
  dim: new THREE.LineBasicMaterial({ color: '#cad86e', transparent: true, opacity: 0.4 }),
  wire: new THREE.LineBasicMaterial({ color: '#6f7550', transparent: true, opacity: 0.75 }),
}

export const SENSOR_MAT = Object.fromEntries(
  SENSOR_KINDS.map((k) => [
    k,
    new THREE.MeshStandardMaterial({ color: SENSOR_SPECS[k].tint, emissive: SENSOR_SPECS[k].tint, emissiveIntensity: 1.3 }),
  ]),
) as Record<SensorKind, THREE.MeshStandardMaterial>
