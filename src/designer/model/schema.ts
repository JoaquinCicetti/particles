import { z } from 'zod'
import {
  DESIGN_KINDS,
  EXTRA_OUTPUT_KINDS,
  ITEM_TYPES,
  ROOM_SHAPES,
  SENSOR_KINDS,
  isControllable,
  isMounted,
} from './constants'
import { clampAll, topAt } from './geometry'
import { KINDS, allowsExtra, allowsItem } from './kinds'

export * from './constants'

/**
 * Design file format (v1): one zone per file. Everything imported — files and
 * the localStorage autosave alike — goes through `parseDesign`: it either
 * returns a complete, normalized design or a list of issues, never a partial
 * load. `roomKind` says which designer the file belongs to and `room.shape`
 * whether the zone is a box or a round silo; files from before either existed
 * are box-shaped grow rooms.
 */

export const FORMAT = 'growcast.room-design'
export const VERSION = 1

/** Hard bounds for any design; each kind narrows the room further (kinds.ts). */
export const LIMITS = {
  side: [1, 100],
  height: [2, 60],
  itemSize: [0.05, 100],
  outputs: [0, 64],
  quantity: [0, 999],
} as const

export type IssueCode = 'type' | 'range' | 'required' | 'not_allowed' | 'outside' | 'duplicate' | 'invalid'
export type ImportIssue = { path: string; code: IssueCode }

const num = (min: number, max: number) => z.number().min(min).max(max)
const isoDate = z
  .string()
  .max(40)
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: 'invalid' })
const vec3 = z.object({ x: num(-1000, 1000), y: num(-1000, 1000), z: num(-1000, 1000) })

export const ItemSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: z.enum(ITEM_TYPES),
    name: z.string().max(80).optional(),
    x: num(-50, 50),
    z: num(-50, 50),
    // up to a silo's roof peak, above its walls
    y: num(0, 100).optional(),
    width: num(...LIMITS.itemSize),
    depth: num(...LIMITS.itemSize),
    // optional: files from before heights were editable have none
    height: num(...LIMITS.itemSize).optional(),
    rotation: z.number().int().min(0).max(3),
    sensorKind: z.enum(SENSOR_KINDS).optional(),
    outputs: z.number().int().min(LIMITS.outputs[0]).max(LIMITS.outputs[1]).optional(),
  })
  .superRefine((it, ctx) => {
    const issue = (path: string, message: 'required' | 'not_allowed') =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (it.type === 'sensor') {
      if (it.sensorKind === undefined) issue('sensorKind', 'required')
    } else if (it.sensorKind !== undefined) issue('sensorKind', 'not_allowed')
    if (isControllable(it.type)) {
      if (it.outputs === undefined) issue('outputs', 'required')
    } else if (it.outputs !== undefined) issue('outputs', 'not_allowed')
    if (isMounted(it.type) && it.y === undefined) issue('y', 'required')
  })

const ExtraOutputSchema = z.object({
  kind: z.enum(EXTRA_OUTPUT_KINDS),
  quantity: z.number().int().min(LIMITS.quantity[0]).max(LIMITS.quantity[1]),
  note: z.string().max(200).default(''),
})

// email is free text here (the UI flags a malformed one): the autosave must
// never reject a design because an address is half-typed
const ContactSchema = z.object({
  name: z.string().max(120).default(''),
  email: z.string().max(160).default(''),
  phone: z.string().max(40).default(''),
  location: z.string().max(160).default(''),
  notes: z.string().max(4000).default(''),
})

export const EMPTY_CONTACT = { name: '', email: '', phone: '', location: '', notes: '' }

export const DesignSchema = z
  .object({
    format: z.literal(FORMAT),
    version: z.literal(VERSION),
    roomKind: z.enum(DESIGN_KINDS).default('grow'),
    name: z.string().trim().min(1).max(80),
    createdAt: isoDate,
    updatedAt: isoDate,
    room: z.object({
      shape: z.enum(ROOM_SHAPES).default('box'),
      width: num(...LIMITS.side),
      length: num(...LIMITS.side),
      height: num(...LIMITS.height),
    }),
    items: z.array(ItemSchema).max(2000),
    extraOutputs: z.array(ExtraOutputSchema).max(100).default([]),
    contact: ContactSchema.default(EMPTY_CONTACT),
    camera: z.object({ position: vec3, target: vec3 }).optional(),
  })
  .superRefine((d, ctx) => {
    const kind = KINDS[d.roomKind]
    const add = (path: Array<string | number>, message: IssueCode) => ctx.addIssue({ code: 'custom', path, message })
    const inRange = (v: number, [lo, hi]: readonly [number, number]) => v >= lo && v <= hi
    if (!kind.shapes.includes(d.room.shape)) add(['room', 'shape'], 'not_allowed')
    if (!inRange(d.room.width, kind.limits.side)) add(['room', 'width'], 'range')
    if (!inRange(d.room.length, kind.limits.side)) add(['room', 'length'], 'range')
    if (!inRange(d.room.height, kind.limits.height)) add(['room', 'height'], 'range')

    const seen = new Set<string>()
    const tol = 0.01
    const round = d.room.shape === 'round'
    d.items.forEach((it, i) => {
      if (seen.has(it.id)) add(['items', i, 'id'], 'duplicate')
      seen.add(it.id)
      // a grow-room light in a silo file is a wrong file, not something to drop
      if (!allowsItem(kind, it)) add(['items', i, it.type === 'sensor' ? 'sensorKind' : 'type'], 'not_allowed')
      // an item whose centre is outside the walls is an error, not something
      // to silently move; small overhangs are trimmed by normalization
      if (round) {
        if (Math.hypot(it.x, it.z) > d.room.width / 2 + tol) add(['items', i, 'x'], 'outside')
      } else {
        if (Math.abs(it.x) > d.room.width / 2 + tol) add(['items', i, 'x'], 'outside')
        if (Math.abs(it.z) > d.room.length / 2 + tol) add(['items', i, 'z'], 'outside')
      }
      if (it.y !== undefined && it.y > topAt(d.room, it.x, it.z) + tol) add(['items', i, 'y'], 'outside')
    })
    d.extraOutputs.forEach((e, i) => {
      if (!allowsExtra(kind, e.kind)) add(['extraOutputs', i, 'kind'], 'not_allowed')
    })
  })

export type Design = z.output<typeof DesignSchema>
export type Item = z.output<typeof ItemSchema>
export type Room = Design['room']
export type ExtraOutput = Design['extraOutputs'][number]
export type Contact = Design['contact']
export type CameraView = NonNullable<Design['camera']>

export type ParseResult =
  | { ok: true; design: Design }
  | { ok: false; reason: 'json' | 'format' | 'version' | 'schema' | 'size'; issues: ImportIssue[]; version?: unknown }

type ZodIssue = z.ZodError['issues'][number]

const formatPath = (path: readonly PropertyKey[]) =>
  path.reduce<string>(
    (s, p) => (typeof p === 'number' ? `${s}[${p}]` : s ? `${s}.${String(p)}` : String(p)),
    '',
  ) || '—'

function toIssue(i: ZodIssue): ImportIssue {
  const path = formatPath(i.path)
  switch (i.code) {
    case 'invalid_type':
      return { path, code: /received undefined/.test(i.message) ? 'required' : 'type' }
    case 'too_small':
    case 'too_big':
      return { path, code: 'range' }
    case 'custom': {
      const known: IssueCode[] = ['range', 'required', 'not_allowed', 'outside', 'duplicate']
      return { path, code: known.find((k) => k === i.message) ?? 'invalid' }
    }
    default:
      return { path, code: 'invalid' }
  }
}

/** Drop fields that don't apply and trim everything inside the walls. */
function normalize(d: Design): Design {
  const items = d.items.map((it) => {
    let out: Item = it
    if (!isMounted(it.type)) {
      const { y: _y, ...rest } = out
      void _y
      out = rest
    }
    // a sensor is the client's product at its real size: no height of its own
    if (it.type === 'sensor') {
      const { height: _h, ...rest } = out
      void _h
      out = rest
    }
    return out
  })
  return clampAll({ ...d, items })
}

/**
 * Grow rooms used to offer generic sensor kinds; they now offer Growcast's own
 * sensor line. Older grow-room files (and autosaves) map onto the nearest one,
 * and the PAR sensor, which is no longer offered, is dropped.
 */
const LEGACY_GROW_SENSORS: Record<string, string | null> = {
  co2: 'temp_humidity_co2',
  substrate_moisture_ec: 'teros12',
  light_par: null,
}

function migrate(r: Record<string, unknown>): Record<string, unknown> {
  if ((r.roomKind ?? 'grow') !== 'grow' || !Array.isArray(r.items)) return r
  const items = r.items.flatMap((it: unknown) => {
    const o = it as { type?: unknown; sensorKind?: unknown } | null
    if (!o || o.type !== 'sensor' || typeof o.sensorKind !== 'string' || !(o.sensorKind in LEGACY_GROW_SENSORS)) return [it]
    const next = LEGACY_GROW_SENSORS[o.sensorKind]
    return next ? [{ ...o, sensorKind: next }] : []
  })
  return { ...r, items }
}

export function parseDesign(raw: unknown): ParseResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, reason: 'format', issues: [] }
  const r = raw as Record<string, unknown>
  if (r.format !== FORMAT) return { ok: false, reason: 'format', issues: [] }
  if (r.version !== VERSION) return { ok: false, reason: 'version', issues: [], version: r.version }
  const res = DesignSchema.safeParse(migrate(r))
  if (!res.success) return { ok: false, reason: 'schema', issues: res.error.issues.map(toIssue) }
  return { ok: true, design: normalize(res.data) }
}
