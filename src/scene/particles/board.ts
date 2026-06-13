import * as THREE from 'three'

/**
 * Shared geometry for the industrial-board formation, so the particle sampler
 * (where the board lives in world space) and the camera (where to fly for the
 * icon zoom) never drift apart.
 *
 * The board art is `public/industrial-board.svg` (extracted from
 * AnimatedGrowcastIndustryWithControlAndExpander). It is portrait, and the
 * Growcast leaf icon sits in the top-right at viewBox (485.8, 61.5).
 */
export const BOARD = {
  vbW: 535.62,
  vbH: 663.24,
  worldHeight: 6.8, // world units tall (sampler maps vbH → this)
  centerY: 2.9, // world Y the board is centered on
}

// viewBox center of the top-right Growcast icon (measured from the source)
const ICON_VB_X = 485.8
const ICON_VB_Y = 61.5

/** Map a viewBox point to the board's world-space plane (z ≈ 0). */
export function boardToWorld(vx: number, vy: number): THREE.Vector3 {
  const scale = BOARD.worldHeight / BOARD.vbH
  return new THREE.Vector3(
    (vx - BOARD.vbW / 2) * scale,
    (BOARD.vbH / 2 - vy) * scale + BOARD.centerY,
    0,
  )
}

/** World-space center of the Growcast icon — the zoom-in finale target. */
export function iconWorldPos(): THREE.Vector3 {
  return boardToWorld(ICON_VB_X, ICON_VB_Y)
}
