import type { MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import type { GlyphKey } from '../ui/glyphs'
import { isGrowcast, isStructure, type ExtraOutputKind, type ItemType, type SensorKind } from './constants'
import type { Room } from './schema'

/** What each placeable thing is: default size, how it mounts, how it's drawn. */
export type ItemSpec = {
  label: MessageDescriptor
  glyph: GlyphKey
  /** default footprint, meters */
  width: number
  depth: number
  /** default body height, meters — each item can carry its own */
  height: number
  /** floor items stand at y=0; mounted items carry an editable mount height */
  mount: 'floor' | 'mounted'
  defaultY?: (room: Room) => number
  /** drawn shorter to fit under a low ceiling */
  shrink?: boolean
}

export const ITEM_SPECS: Record<ItemType, ItemSpec> = {
  // ── grow room ──
  rack: { label: D.typeRack, glyph: 'rack', width: 1.2, depth: 0.6, height: 2, mount: 'floor', shrink: true },
  table: { label: D.typeTable, glyph: 'table', width: 2.4, depth: 1.2, height: 0.9, mount: 'floor' },
  light: {
    label: D.typeLight,
    glyph: 'light',
    width: 1.1,
    depth: 1.1,
    height: 0.06,
    mount: 'mounted',
    defaultY: (r) => Math.max(0.6, r.height - 0.6),
  },
  climate: {
    label: D.typeClimate,
    glyph: 'climate',
    width: 0.9,
    depth: 0.25,
    height: 0.3,
    mount: 'mounted',
    defaultY: (r) => Math.min(2.3, r.height - 0.45),
  },
  fan: {
    label: D.typeFan,
    glyph: 'fan',
    width: 0.4,
    depth: 0.3,
    height: 0.45,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.5, r.height - 0.6),
  },
  humidifier: {
    label: D.typeHumidifier,
    glyph: 'humidifier',
    width: 0.45,
    depth: 0.45,
    height: 0.7,
    mount: 'floor',
  },

  // ── silo (manual §5.1) ──
  aerator: { label: D.typeAerator, glyph: 'aerator', width: 0.9, depth: 1.1, height: 1, mount: 'floor' },

  // ── curing room (manual §5.5) ──
  cheese_rack: {
    label: D.typeCheeseRack,
    glyph: 'cheese',
    width: 2,
    depth: 0.6,
    height: 2,
    mount: 'floor',
    shrink: true,
  },
  hanger: { label: D.typeHanger, glyph: 'hanger', width: 2, depth: 0.8, height: 2, mount: 'floor', shrink: true },
  pallet: { label: D.typePallet, glyph: 'pallet', width: 1.2, depth: 1, height: 1.2, mount: 'floor', shrink: true },
  trolley: { label: D.typeTrolley, glyph: 'trolley', width: 1, depth: 0.7, height: 1.8, mount: 'floor', shrink: true },
  cooler: {
    label: D.typeCooler,
    glyph: 'cooler',
    width: 1.4,
    depth: 0.5,
    height: 0.5,
    mount: 'mounted',
    defaultY: (r) => Math.max(0, Math.min(2.3, r.height - 0.6)),
  },
  heater: { label: D.typeHeater, glyph: 'heater', width: 0.7, depth: 0.25, height: 0.6, mount: 'floor' },
  dehumidifier: {
    label: D.typeDehumidifier,
    glyph: 'dehumidifier',
    width: 0.5,
    depth: 0.4,
    height: 0.8,
    mount: 'floor',
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
  },

  // ── Growcast hardware — sizes are placeholders until the client confirms them ──
  // proportions of the client's growcast.glb (1.22 : 1.18 : 2.0, w : h : d)
  growcast_plus: {
    label: D.typeGrowcastPlus,
    glyph: 'device',
    width: 0.13,
    depth: 0.2,
    height: 0.12,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.4, r.height - 0.4),
  },
  // the rectangular industrial panel (tableros de 3, 6 y 9 controles)
  growcast_industria: {
    label: D.typeIndustria,
    glyph: 'board',
    width: 0.6,
    depth: 0.22,
    height: 0.8,
    mount: 'mounted',
    defaultY: (r) => Math.max(0, Math.min(1.1, r.height - 1)),
  },
  control_module: {
    label: D.typeControlModule,
    glyph: 'module',
    width: 0.12,
    depth: 0.06,
    height: 0.12,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.4, r.height - 0.3),
  },
  expander: {
    label: D.typeExpander,
    glyph: 'expander',
    width: 0.16,
    depth: 0.05,
    height: 0.1,
    mount: 'mounted',
    defaultY: (r) => Math.min(1.4, r.height - 0.3),
  },

  // ── the customer's own equipment, whatever it is: they name it ──
  appliance: { label: D.typeAppliance, glyph: 'appliance', width: 0.6, depth: 0.6, height: 0.9, mount: 'floor' },
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
  temp_humidity_co2: { label: D.kindAirCo2, short: 'T°·HR·CO₂', glyph: 'co2', tint: '#86b59b', ground: false },
  teros12: { label: D.kindTeros12, short: 'TEROS 12', glyph: 'substrate', tint: '#d6a266', ground: true },
  temp_pressure: { label: D.kindPressure, short: 'T°·P', glyph: 'press', tint: '#b9a6e6', ground: false },
  soil_moisture: { label: D.kindSoil, short: 'H. suelo', glyph: 'soil', tint: '#c9a57a', ground: true },
  water_ph_ec: { label: D.kindWater, short: 'pH·EC', glyph: 'water', tint: '#86bcd4', ground: true },
  co2: { label: D.kindCo2, short: 'CO₂', glyph: 'co2', tint: '#86b59b', ground: false },
  interior_temp_humidity: { label: D.kindInterior, short: 'T°·HR int.', glyph: 'air', tint: '#f5c98d', ground: false },
  outdoor_temp_humidity: { label: D.kindOutdoor, short: 'T°·HR ext.', glyph: 'station', tint: '#9fc3e6', ground: false },
}

/**
 * One flat, filterable list of everything that can be placed — the panel shows
 * it as a single palette rather than as numbered steps, so a sensor is no
 * harder to reach than a rack. `group` only drives the filter chips: the
 * customer's structures, their own equipment (peripherals Growcast controls),
 * and Growcast's hardware — devices, modules and sensors. Each design kind
 * builds its own list (see kinds.ts).
 */
export type CatalogGroup = 'structure' | 'peripheral' | 'growcast'

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
  t === 'sensor' || isGrowcast(t) ? 'growcast' : isStructure(t) ? 'structure' : 'peripheral'

export const EXTRA_SPECS: Record<ExtraOutputKind, { label: MessageDescriptor; glyph: GlyphKey }> = {
  irrigation_pump: { label: D.exPump, glyph: 'pump' },
  extractor: { label: D.exExtractor, glyph: 'extractor' },
  solenoid: { label: D.exSolenoid, glyph: 'solenoid' },
  dehumidifier: { label: D.exDehumidifier, glyph: 'dehumidifier' },
  heater: { label: D.exHeater, glyph: 'heater' },
  co2_injector: { label: D.exCo2, glyph: 'co2inj' },
  other: { label: D.exOther, glyph: 'plus' },
}
