import * as THREE from 'three'
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
export const PLANT_GEO = new THREE.IcosahedronGeometry(1, 0)
export const POT_GEO = new THREE.CylinderGeometry(0.5, 0.38, 1, 8)
export const TORUS_GEO = new THREE.TorusGeometry(0.17, 0.012, 8, 40)
export const HIT_GEO = new THREE.SphereGeometry(0.5, 8, 6)
export const PLANE_GEO = new THREE.PlaneGeometry(1, 1)

/** Square light cone (side 1 at the top) widening towards the floor. */
export const CONE_GEO = (() => {
  const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2 * 1.45, 1, 4, 1, true)
  g.rotateY(Math.PI / 4)
  return g
})()

export const MAT = {
  floor: new THREE.MeshStandardMaterial({ color: '#0d0a08', roughness: 1, metalness: 0 }),
  wall: new THREE.MeshStandardMaterial({ color: '#16110d', roughness: 1, metalness: 0 }),
  body: new THREE.MeshStandardMaterial({ color: '#1d1611', roughness: 0.8, metalness: 0.2 }),
  shell: new THREE.MeshStandardMaterial({ color: '#2d231b', roughness: 0.6, metalness: 0.1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#3b2e23', roughness: 0.45, metalness: 0.6 }),
  tray: new THREE.MeshStandardMaterial({ color: '#241b14', roughness: 0.7 }),
  water: new THREE.MeshStandardMaterial({ color: '#16242a', roughness: 0.25, metalness: 0.2 }),
  plant: new THREE.MeshStandardMaterial({ color: '#5f7c46', roughness: 0.85, flatShading: true }),
  pot: new THREE.MeshStandardMaterial({ color: '#17120e', roughness: 0.9 }),
  led: new THREE.MeshStandardMaterial({ color: '#ffe3b8', emissive: '#ffd49a', emissiveIntensity: 1.5 }),
  cone: new THREE.MeshBasicMaterial({
    color: '#ffd9a0',
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  footprint: new THREE.MeshBasicMaterial({ color: '#c87f3d', transparent: true, opacity: 0.12, depthWrite: false }),
}

export type Tone = 'idle' | 'hover' | 'selected'

export const EDGE: Record<Tone, THREE.LineBasicMaterial> = {
  idle: new THREE.LineBasicMaterial({ color: '#c87f3d', transparent: true, opacity: 0.5 }),
  hover: new THREE.LineBasicMaterial({ color: '#e8a261', transparent: true, opacity: 0.95 }),
  selected: new THREE.LineBasicMaterial({ color: '#ffd9a0' }),
}

export const LINE = {
  room: new THREE.LineBasicMaterial({ color: '#c87f3d', transparent: true, opacity: 0.8 }),
  dim: new THREE.LineBasicMaterial({ color: '#c87f3d', transparent: true, opacity: 0.4 }),
  wire: new THREE.LineBasicMaterial({ color: '#9a6a44', transparent: true, opacity: 0.75 }),
}

export const SENSOR_MAT = Object.fromEntries(
  SENSOR_KINDS.map((k) => [
    k,
    new THREE.MeshStandardMaterial({ color: SENSOR_SPECS[k].tint, emissive: SENSOR_SPECS[k].tint, emissiveIntensity: 1.3 }),
  ]),
) as Record<SensorKind, THREE.MeshStandardMaterial>
