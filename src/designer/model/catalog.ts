import type { MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import type { GlyphKey } from '../ui/glyphs'
import { isStructure, type ExtraOutputKind, type ItemType, type SensorKind } from './constants'
import type { Room } from './schema'

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
  /** drawn shorter to fit under a low ceiling */
  shrink?: boolean
}

export const ITEM_SPECS: Record<ItemType, ItemSpec> = {
  // ── grow room ──
  rack: { label: D.typeRack, glyph: 'rack', width: 1.2, depth: 0.6, height: 2, mount: 'floor', resizable: true, shrink: true },
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

  // ── silo (manual §5.1) ──
  aerator: { label: D.typeAerator, glyph: 'aerator', width: 0.9, depth: 1.1, height: 1, mount: 'floor', resizable: false },

  // ── curing room (manual §5.5) ──
  cheese_rack: {
    label: D.typeCheeseRack,
    glyph: 'cheese',
    width: 2,
    depth: 0.6,
    height: 2,
    mount: 'floor',
    resizable: true,
    shrink: true,
  },
  hanger: { label: D.typeHanger, glyph: 'hanger', width: 2, depth: 0.8, height: 2, mount: 'floor', resizable: true, shrink: true },
  pallet: { label: D.typePallet, glyph: 'pallet', width: 1.2, depth: 1, height: 1.2, mount: 'floor', resizable: true, shrink: true },
  trolley: { label: D.typeTrolley, glyph: 'trolley', width: 1, depth: 0.7, height: 1.8, mount: 'floor', resizable: true, shrink: true },
  cooler: {
    label: D.typeCooler,
    glyph: 'cooler',
    width: 1.4,
    depth: 0.5,
    height: 0.5,
    mount: 'mounted',
    defaultY: (r) => Math.max(0, Math.min(2.3, r.height - 0.6)),
    resizable: true,
  },
  heater: { label: D.typeHeater, glyph: 'heater', width: 0.7, depth: 0.25, height: 0.6, mount: 'floor', resizable: false },
  dehumidifier: {
    label: D.typeDehumidifier,
    glyph: 'dehumidifier',
    width: 0.5,
    depth: 0.4,
    height: 0.8,
    mount: 'floor',
    resizable: false,
  },

  // ── shared ──
  extractor: {
    label: D.typeExtractor,
    glyph: 'extractor',
    width: 0.6,
    depth: 0.35,
    height: 0.6,
    mount: 'mounted',
    defaultY: (r) => Math.max(0, Math.min(2.2, r.height - 0.8)),
    resizable: false,
  },
  // sized to the client's sensor model (scene/materials.ts, SENSOR_HEIGHT)
  sensor: {
    label: D.typeSensor,
    glyph: 'air',
    width: 0.12,
    depth: 0.12,
    height: 0.2,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.5, r.height - 0.3),
    resizable: false,
  },
}

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
  air_temp_humidity: { label: D.kindAir, short: 'T°·HR', glyph: 'air', tint: '#f5c98d', ground: false },
  co2: { label: D.kindCo2, short: 'CO₂', glyph: 'co2', tint: '#86b59b', ground: false },
  substrate_moisture_ec: { label: D.kindSubstrate, short: 'SUST', glyph: 'substrate', tint: '#d6a266', ground: true },
  water_ph_ec: { label: D.kindWater, short: 'pH·EC', glyph: 'water', tint: '#86bcd4', ground: true },
  light_par: { label: D.kindPar, short: 'PAR', glyph: 'par', tint: '#e0a7d8', ground: false },
  interior_temp_humidity: { label: D.kindInterior, short: 'T°·HR int.', glyph: 'air', tint: '#f5c98d', ground: false },
  outdoor_temp_humidity: { label: D.kindOutdoor, short: 'T°·HR ext.', glyph: 'station', tint: '#9fc3e6', ground: false },
}

/**
 * One flat, filterable list of everything that can be placed — the panel shows
 * it as a single palette rather than as numbered steps, so a sensor is no
 * harder to reach than a rack. `group` only drives the filter chips. Each
 * design kind builds its own list (see kinds.ts).
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
  t === 'sensor' ? 'sensor' : isStructure(t) ? 'structure' : 'equipment'

export const EXTRA_SPECS: Record<ExtraOutputKind, { label: MessageDescriptor; glyph: GlyphKey }> = {
  irrigation_pump: { label: D.exPump, glyph: 'pump' },
  extractor: { label: D.exExtractor, glyph: 'extractor' },
  solenoid: { label: D.exSolenoid, glyph: 'solenoid' },
  dehumidifier: { label: D.exDehumidifier, glyph: 'dehumidifier' },
  heater: { label: D.exHeater, glyph: 'heater' },
  co2_injector: { label: D.exCo2, glyph: 'co2inj' },
  other: { label: D.exOther, glyph: 'plus' },
}
