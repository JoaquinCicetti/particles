import * as THREE from 'three'

/**
 * Path definitions for the particle flow.
 *
 * Placeholder: a single sweeping curve that dives toward the origin, where
 * the future "electric board" formation will live. The detailed scene will
 * replace/extend these with the real choreography (multiple streams merging
 * into the circuit-board layout).
 */
export const flowPath = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-9, 3.5, -4),
    new THREE.Vector3(-5, 1.5, 2),
    new THREE.Vector3(-1.5, 2.5, -1.5),
    new THREE.Vector3(2, 0.5, 2.5),
    new THREE.Vector3(5.5, 1.8, -2),
    new THREE.Vector3(9, 0, 0),
  ],
  false,
  'catmullrom',
  0.6,
)
