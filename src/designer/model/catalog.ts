import type { MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import type { GlyphKey } from '../ui/glyphs'
import { SENSOR_KINDS, type ExtraOutputKind, type ItemType, type Room, type SensorKind } from './schema'

/** What each placeable thing is: default size, how it mounts, how it's drawn. */
export type ItemSpec = {
  label: MessageDescriptor
  glyph: GlyphKey
  /** default footprint, meters */
  width: number
  depth: number
  /** body height of the 3D model, meters */
  height: number
  /** floor items stand at y=0; mounted items carry an editable mount height */
  mount: 'floor' | 'mounted'
  defaultY?: (room: Room) => number
  resizable: boolean
}

export const ITEM_SPECS: Record<ItemType, ItemSpec> = {
  rack: { label: D.typeRack, glyph: 'rack', width: 1.2, depth: 0.6, height: 2, mount: 'floor', resizable: true },
  table: { label: D.typeTable, glyph: 'table', width: 2.4, depth: 1.2, height: 0.9, mount: 'floor', resizable: true },
  light: {
    label: D.typeLight,
    glyph: 'light',
    width: 1.1,
    depth: 1.1,
    height: 0.06,
    mount: 'mounted',
    defaultY: (r) => Math.max(0.6, r.height - 0.6),
    resizable: true,
  },
  climate: {
    label: D.typeClimate,
    glyph: 'climate',
    width: 0.9,
    depth: 0.25,
    height: 0.3,
    mount: 'mounted',
    defaultY: (r) => Math.min(2.3, r.height - 0.45),
    resizable: true,
  },
  fan: {
    label: D.typeFan,
    glyph: 'fan',
    width: 0.4,
    depth: 0.3,
    height: 0.45,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.5, r.height - 0.6),
    resizable: false,
  },
  humidifier: {
    label: D.typeHumidifier,
    glyph: 'humidifier',
    width: 0.45,
    depth: 0.45,
    height: 0.7,
    mount: 'floor',
    resizable: false,
  },
  sensor: {
    label: D.typeSensor,
    glyph: 'air',
    width: 0.16,
    depth: 0.16,
    height: 0.08,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.5, r.height - 0.3),
    resizable: false,
  },
}

export const STRUCTURE_TYPES = ['rack', 'table'] as const satisfies readonly ItemType[]
export const EQUIPMENT_TYPES = ['light', 'climate', 'fan', 'humidifier'] as const satisfies readonly ItemType[]

export type SensorSpec = {
  label: MessageDescriptor
  short: string
  glyph: GlyphKey
  /** accent used for the 3D glow and the plan dot */
  tint: string
  /** substrate and water probes sit at ground level by default */
  ground: boolean
}

export const SENSOR_SPECS: Record<SensorKind, SensorSpec> = {
  air_temp_humidity: { label: D.kindAir, short: 'T°·HR', glyph: 'air', tint: '#ffd9a0', ground: false },
  co2: { label: D.kindCo2, short: 'CO₂', glyph: 'co2', tint: '#a9cdb8', ground: false },
  substrate_moisture_ec: { label: D.kindSubstrate, short: 'SUST', glyph: 'substrate', tint: '#d6a266', ground: true },
  water_ph_ec: { label: D.kindWater, short: 'pH·EC', glyph: 'water', tint: '#86bcd4', ground: true },
  light_par: { label: D.kindPar, short: 'PAR', glyph: 'par', tint: '#f1e38c', ground: false },
}

/**
 * One flat, filterable list of everything that can be placed — the panel shows
 * it as a single palette rather than as numbered steps, so a sensor is no
 * harder to reach than a rack. `group` only drives the filter chips.
 */
export type CatalogGroup = 'structure' | 'equipment' | 'sensor'

export type CatalogEntry = {
  /** stable key for React and for the filter */
  key: string
  group: CatalogGroup
  type: ItemType
  sensorKind?: SensorKind
  label: MessageDescriptor
  glyph: GlyphKey
  tint?: string
}

export const groupOf = (t: ItemType): CatalogGroup =>
  t === 'sensor' ? 'sensor' : (STRUCTURE_TYPES as readonly ItemType[]).includes(t) ? 'structure' : 'equipment'

export const CATALOG: readonly CatalogEntry[] = [
  ...[...STRUCTURE_TYPES, ...EQUIPMENT_TYPES].map((type) => ({
    key: type,
    group: groupOf(type),
    type,
    label: ITEM_SPECS[type].label,
    glyph: ITEM_SPECS[type].glyph,
  })),
  ...SENSOR_KINDS.map((k) => ({
    key: `sensor:${k}`,
    group: 'sensor' as const,
    type: 'sensor' as const,
    sensorKind: k,
    label: SENSOR_SPECS[k].label,
    glyph: SENSOR_SPECS[k].glyph,
    tint: SENSOR_SPECS[k].tint,
  })),
]

export const EXTRA_SPECS: Record<ExtraOutputKind, { label: MessageDescriptor; glyph: GlyphKey }> = {
  irrigation_pump: { label: D.exPump, glyph: 'pump' },
  extractor: { label: D.exExtractor, glyph: 'extractor' },
  solenoid: { label: D.exSolenoid, glyph: 'solenoid' },
  dehumidifier: { label: D.exDehumidifier, glyph: 'dehumidifier' },
  heater: { label: D.exHeater, glyph: 'heater' },
  co2_injector: { label: D.exCo2, glyph: 'co2inj' },
  other: { label: D.exOther, glyph: 'plus' },
}
