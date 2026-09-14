/**
 * The enums every other model module builds on. A leaf module — it imports
 * nothing — so schema, catalog, kinds and geometry can all depend on it
 * without the load order of a cycle deciding what is defined.
 */

export const DESIGN_KINDS = ['grow', 'silo', 'curing'] as const
export type DesignKind = (typeof DESIGN_KINDS)[number]

/** A zone is a box (a room, a storage cell, a shed) or round (a silo, under its cone roof). */
export const ROOM_SHAPES = ['box', 'round'] as const
export type RoomShape = (typeof ROOM_SHAPES)[number]

export const ITEM_TYPES = [
  // grow room
  'rack',
  'table',
  'light',
  'climate',
  'fan',
  'humidifier',
  // silo
  'aerator',
  // curing room
  'cheese_rack',
  'hanger',
  'pallet',
  'trolley',
  'cooler',
  'heater',
  'dehumidifier',
  // shared
  'extractor',
  'sensor',
  // Growcast hardware
  'growcast_plus',
  'growcast_industria',
  'control_module',
  'expander',
  // the customer's own equipment, named by them
  'appliance',
] as const
export type ItemType = (typeof ITEM_TYPES)[number]

export const SENSOR_KINDS = [
  // Growcast's own sensors
  'air_temp_humidity',
  'temp_humidity_co2',
  'teros12',
  'temp_pressure',
  'soil_moisture',
  'water_ph_ec',
  // silo and curing-room placements
  'co2',
  'interior_temp_humidity',
  'outdoor_temp_humidity',
] as const
export type SensorKind = (typeof SENSOR_KINDS)[number]

/** Growcast's own devices and modules (docs: /wiki/link-modules, /wiki/industrial-installation). */
export const GROWCAST_TYPES = ['growcast_plus', 'growcast_industria', 'control_module', 'expander'] as const
export type GrowcastType = (typeof GROWCAST_TYPES)[number]

export const STRUCTURE_TYPES = ['rack', 'table', 'cheese_rack', 'hanger', 'pallet', 'trolley'] as const
export type StructureType = (typeof STRUCTURE_TYPES)[number]

export const CONTROLLABLE_TYPES = [
  'light',
  'climate',
  'fan',
  'humidifier',
  'aerator',
  'extractor',
  'cooler',
  'heater',
  'dehumidifier',
  'appliance',
] as const
export type ControllableType = (typeof CONTROLLABLE_TYPES)[number]

/** Types placed at a mount height (`y`); the rest stand on the floor. */
export const MOUNTED_TYPES = [
  'light',
  'climate',
  'fan',
  'sensor',
  'extractor',
  'cooler',
  'growcast_plus',
  'growcast_industria',
  'control_module',
  'expander',
] as const

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
export const isStructure = (t: ItemType): t is StructureType => (STRUCTURE_TYPES as readonly string[]).includes(t)
export const isMounted = (t: ItemType) => (MOUNTED_TYPES as readonly string[]).includes(t)
export const isGrowcast = (t: ItemType): t is GrowcastType => (GROWCAST_TYPES as readonly string[]).includes(t)
