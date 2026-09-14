import { ITEM_SPECS, SENSOR_SPECS } from './catalog'
import { KINDS } from './kinds'
import {
  EMPTY_CONTACT,
  FORMAT,
  VERSION,
  isControllable,
  type Design,
  type DesignKind,
  type Item,
  type ItemType,
  type Room,
  type SensorKind,
} from './schema'

/** randomUUID needs a secure context — keep LAN-IP testing on phones working. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && window.isSecureContext) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}

export function createDesign(kind: DesignKind, name: string): Design {
  const now = new Date().toISOString()
  return {
    format: FORMAT,
    version: VERSION,
    roomKind: kind,
    name,
    createdAt: now,
    updatedAt: now,
    room: { ...KINDS[kind].room },
    items: [],
    extraOutputs: [],
    contact: { ...EMPTY_CONTACT },
  }
}

export function createItem(type: ItemType, room: Room, sensorKind?: SensorKind): Item {
  const spec = ITEM_SPECS[type]
  const it: Item = { id: newId(), type, x: 0, z: 0, width: spec.width, depth: spec.depth, rotation: 0 }
  if (type === 'sensor') it.sensorKind = sensorKind ?? 'air_temp_humidity'
  if (spec.mount === 'mounted') {
    it.y = type === 'sensor' && SENSOR_SPECS[it.sensorKind!].ground ? 0 : (spec.defaultY?.(room) ?? 0)
  }
  if (isControllable(type)) it.outputs = 1
  return it
}
