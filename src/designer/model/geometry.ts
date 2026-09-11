import { ITEM_SPECS } from './catalog'
import type { Design, Item, Room } from './schema'

/** Placement snap, meters. */
export const SNAP = 0.1

const r3 = (v: number) => Math.round(v * 1000) / 1000
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const snap = (v: number, step = SNAP) => r3(Math.round(v / step) * step)

/** Axis-aligned footprint after the quarter-turn rotation. */
export function footprint(it: Pick<Item, 'width' | 'depth' | 'rotation'>) {
  const odd = it.rotation % 2 === 1
  return { w: odd ? it.depth : it.width, d: odd ? it.width : it.depth }
}

/** Drawn body height (racks shrink to fit low ceilings). */
export function bodyHeight(it: Pick<Item, 'type'>, room: Room) {
  const h = ITEM_SPECS[it.type].height
  return it.type === 'rack' ? Math.max(0.6, Math.min(h, room.height - 0.2)) : h
}

/** Keep an item fully inside the walls: shrink if needed, then clamp. */
export function clampItem(it: Item, room: Room): Item {
  const odd = it.rotation % 2 === 1
  const width = r3(clamp(it.width, 0.05, odd ? room.length : room.width))
  const depth = r3(clamp(it.depth, 0.05, odd ? room.width : room.length))
  const { w, d } = footprint({ width, depth, rotation: it.rotation })
  const hx = Math.max(0, room.width / 2 - w / 2)
  const hz = Math.max(0, room.length / 2 - d / 2)
  const next: Item = { ...it, width, depth, x: r3(clamp(it.x, -hx, hx)), z: r3(clamp(it.z, -hz, hz)) }
  if (ITEM_SPECS[it.type].mount === 'mounted') {
    next.y = r3(clamp(it.y ?? 0, 0, Math.max(0, room.height - ITEM_SPECS[it.type].height)))
  }
  return next
}

export const clampAll = (d: Design): Design => ({ ...d, items: d.items.map((i) => clampItem(i, d.room)) })

const layer = (it: Item) => (it.type === 'sensor' ? 'sensor' : ITEM_SPECS[it.type].mount)

function overlaps(a: Item, b: Item) {
  const fa = footprint(a)
  const fb = footprint(b)
  return Math.abs(a.x - b.x) < (fa.w + fb.w) / 2 - 1e-3 && Math.abs(a.z - b.z) < (fa.d + fb.d) / 2 - 1e-3
}

/**
 * Nearest spot to the room centre where `probe` doesn't overlap anything on
 * its own layer (floor / hung equipment / sensors). Falls back to the centre.
 */
export function findFreeSpot(d: Design, probe: Item): { x: number; z: number } {
  const { w, d: dep } = footprint(probe)
  const hx = Math.max(0, d.room.width / 2 - w / 2)
  const hz = Math.max(0, d.room.length / 2 - dep / 2)
  const others = d.items.filter((o) => layer(o) === layer(probe))
  if (!others.length) return { x: snap(0), z: snap(0) }
  const step = Math.max(0.25, Math.max(d.room.width, d.room.length) / 40)
  const spots: Array<{ x: number; z: number; r: number }> = []
  for (let i = -Math.floor(hx / step); i <= Math.floor(hx / step); i++) {
    for (let k = -Math.floor(hz / step); k <= Math.floor(hz / step); k++) {
      const x = i * step
      const z = k * step
      spots.push({ x, z, r: x * x + z * z })
    }
  }
  spots.sort((a, b) => a.r - b.r)
  for (const s of spots) {
    const cand = { ...probe, x: snap(s.x), z: snap(s.z) }
    if (!others.some((o) => overlaps(cand, o))) return { x: cand.x, z: cand.z }
  }
  return { x: 0, z: 0 }
}
