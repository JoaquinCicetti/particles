import { ITEM_SPECS } from './catalog'
import { KINDS } from './kinds'
import type { Design, DesignKind, Item, Room } from './schema'

/** Placement snap, meters. */
export const SNAP = 0.1

const r3 = (v: number) => Math.round(v * 1000) / 1000
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const snap = (v: number, step = SNAP) => r3(Math.round(v / step) * step)

/** Roof pitch of a round zone — a silo's cone. The 3D shell is drawn from it too. */
export const SILO_ROOF_SLOPE = Math.tan((22 * Math.PI) / 180)

/** How far a round zone's cone rises above its walls; box zones are flat-topped. */
export const roofRise = (room: Room) => (room.shape === 'round' ? (room.width / 2) * SILO_ROOF_SLOPE : 0)

/** The top of the zone over (x, z): its ceiling, or the silo's cone above that point. */
export function topAt(room: Room, x: number, z: number) {
  if (room.shape !== 'round') return room.height
  const r = room.width / 2
  return room.height + roofRise(room) * (1 - Math.min(r, Math.hypot(x, z)) / r)
}

/** A round zone is as long as it is wide. */
export const settleRoom = (room: Room): Room =>
  room.shape === 'round' && room.length !== room.width ? { ...room, length: room.width } : room

/** Axis-aligned footprint after the quarter-turn rotation. */
export function footprint(it: Pick<Item, 'width' | 'depth' | 'rotation'>) {
  const odd = it.rotation % 2 === 1
  return { w: odd ? it.depth : it.width, d: odd ? it.width : it.depth }
}

/** Drawn body height, shortened to clear a low ceiling where that applies. */
export function bodyHeight(it: Pick<Item, 'type'>, room: Room) {
  const spec = ITEM_SPECS[it.type]
  return spec.shrink ? Math.max(0.6, Math.min(spec.height, room.height - 0.2)) : spec.height
}

/** Highest mount height for an item: under the ceiling, or — where the kind allows — on the roof. */
export function maxMountY(it: Item, room: Room, kind: DesignKind) {
  const top = topAt(room, it.x, it.z)
  return Math.max(0, KINDS[kind].onTop ? top : top - bodyHeight(it, room))
}

/** Keep an item fully inside the walls: shrink if needed, then clamp. */
export function clampItem(it: Item, room: Room, kind: DesignKind): Item {
  let next: Item
  if (room.shape === 'round') {
    const width = r3(clamp(it.width, 0.05, room.width))
    const depth = r3(clamp(it.depth, 0.05, room.width))
    const { w, d } = footprint({ width, depth, rotation: it.rotation })
    // keep the item's corners inside the circle, not just its centre
    const reach = Math.max(0, room.width / 2 - Math.hypot(w, d) / 2)
    const dist = Math.hypot(it.x, it.z)
    const k = dist > reach ? reach / dist : 1
    next = { ...it, width, depth, x: r3(it.x * k), z: r3(it.z * k) }
  } else {
    const odd = it.rotation % 2 === 1
    const width = r3(clamp(it.width, 0.05, odd ? room.length : room.width))
    const depth = r3(clamp(it.depth, 0.05, odd ? room.width : room.length))
    const { w, d } = footprint({ width, depth, rotation: it.rotation })
    const hx = Math.max(0, room.width / 2 - w / 2)
    const hz = Math.max(0, room.length / 2 - d / 2)
    next = { ...it, width, depth, x: r3(clamp(it.x, -hx, hx)), z: r3(clamp(it.z, -hz, hz)) }
  }
  if (ITEM_SPECS[it.type].mount === 'mounted') {
    next.y = r3(clamp(it.y ?? 0, 0, maxMountY(next, room, kind)))
  }
  return next
}

export function clampAll(d: Design): Design {
  const room = settleRoom(d.room)
  return { ...d, room, items: d.items.map((i) => clampItem(i, room, d.roomKind)) }
}

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
  const reach = d.room.shape === 'round' ? d.room.width / 2 - Math.hypot(w, dep) / 2 : Infinity
  const others = d.items.filter((o) => layer(o) === layer(probe))
  if (!others.length) return { x: snap(0), z: snap(0) }
  const step = Math.max(0.25, Math.max(d.room.width, d.room.length) / 40)
  const spots: Array<{ x: number; z: number; r: number }> = []
  for (let i = -Math.floor(hx / step); i <= Math.floor(hx / step); i++) {
    for (let k = -Math.floor(hz / step); k <= Math.floor(hz / step); k++) {
      const x = i * step
      const z = k * step
      if (Math.hypot(x, z) <= reach) spots.push({ x, z, r: x * x + z * z })
    }
  }
  spots.sort((a, b) => a.r - b.r)
  for (const s of spots) {
    const cand = { ...probe, x: snap(s.x), z: snap(s.z) }
    if (!others.some((o) => overlaps(cand, o))) return { x: cand.x, z: cand.z }
  }
  return { x: 0, z: 0 }
}
