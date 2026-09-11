import { z } from 'zod'
import { clampAll } from './geometry'

/**
 * Room design file format (v1). Everything imported — files and the
 * localStorage autosave alike — goes through `parseDesign`: it either returns
 * a complete, normalized design or a list of issues, never a partial load.
 */

export const FORMAT = 'growcast.room-design'
export const VERSION = 1

export const ITEM_TYPES = ['rack', 'table', 'light', 'climate', 'fan', 'humidifier', 'sensor'] as const
export type ItemType = (typeof ITEM_TYPES)[number]

export const SENSOR_KINDS = ['air_temp_humidity', 'co2', 'substrate_moisture_ec', 'water_ph_ec', 'light_par'] as const
export type SensorKind = (typeof SENSOR_KINDS)[number]

export const CONTROLLABLE_TYPES = ['light', 'climate', 'fan', 'humidifier'] as const
export type ControllableType = (typeof CONTROLLABLE_TYPES)[number]

/** Types placed at a mount height (`y`); the rest stand on the floor. */
export const MOUNTED_TYPES = ['light', 'climate', 'fan', 'sensor'] as const

export const EXTRA_OUTPUT_KINDS = [
  'irrigation_pump',
  'extractor',
  'solenoid',
  'dehumidifier',
  'heater',
  'co2_injector',
  'other',
] as const
export type ExtraOutputKind = (typeof EXTRA_OUTPUT_KINDS)[number]

export const isControllable = (t: ItemType): t is ControllableType =>
  (CONTROLLABLE_TYPES as readonly string[]).includes(t)
export const isMounted = (t: ItemType) => (MOUNTED_TYPES as readonly string[]).includes(t)

export const LIMITS = {
  side: [1, 100],
  height: [2, 12],
  itemSize: [0.05, 100],
  outputs: [0, 64],
  quantity: [0, 999],
} as const

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
    y: num(0, 12).optional(),
    width: num(...LIMITS.itemSize),
    depth: num(...LIMITS.itemSize),
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
    roomKind: z.literal('grow').default('grow'),
    name: z.string().trim().min(1).max(80),
    createdAt: isoDate,
    updatedAt: isoDate,
    room: z.object({
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
    const seen = new Set<string>()
    const tol = 0.01
    d.items.forEach((it, i) => {
      if (seen.has(it.id)) ctx.addIssue({ code: 'custom', path: ['items', i, 'id'], message: 'duplicate' })
      seen.add(it.id)
      // an item whose centre is outside the walls is an error, not something
      // to silently move; small overhangs are trimmed by normalization
      if (Math.abs(it.x) > d.room.width / 2 + tol)
        ctx.addIssue({ code: 'custom', path: ['items', i, 'x'], message: 'outside' })
      if (Math.abs(it.z) > d.room.length / 2 + tol)
        ctx.addIssue({ code: 'custom', path: ['items', i, 'z'], message: 'outside' })
      if (it.y !== undefined && it.y > d.room.height + tol)
        ctx.addIssue({ code: 'custom', path: ['items', i, 'y'], message: 'outside' })
    })
  })

export type Design = z.output<typeof DesignSchema>
export type Item = z.output<typeof ItemSchema>
export type Room = Design['room']
export type ExtraOutput = Design['extraOutputs'][number]
export type Contact = Design['contact']
export type CameraView = NonNullable<Design['camera']>

export type IssueCode = 'type' | 'range' | 'required' | 'not_allowed' | 'outside' | 'duplicate' | 'invalid'
export type ImportIssue = { path: string; code: IssueCode }

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
      const known: IssueCode[] = ['required', 'not_allowed', 'outside', 'duplicate']
      return { path, code: known.find((k) => k === i.message) ?? 'invalid' }
    }
    default:
      return { path, code: 'invalid' }
  }
}

/** Drop fields that don't apply and trim everything inside the walls. */
function normalize(d: Design): Design {
  const items = d.items.map((it) => {
    if (isMounted(it.type)) return it
    const { y: _drop, ...rest } = it
    void _drop
    return rest
  })
  return clampAll({ ...d, items })
}

export function parseDesign(raw: unknown): ParseResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, reason: 'format', issues: [] }
  const r = raw as Record<string, unknown>
  if (r.format !== FORMAT) return { ok: false, reason: 'format', issues: [] }
  if (r.version !== VERSION) return { ok: false, reason: 'version', issues: [], version: r.version }
  const res = DesignSchema.safeParse(raw)
  if (!res.success) return { ok: false, reason: 'schema', issues: res.error.issues.map(toIssue) }
  return { ok: true, design: normalize(res.data) }
}
