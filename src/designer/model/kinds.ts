import type { MessageDescriptor } from 'react-intl'
import { DESIGNER_PATHS } from '../../lib/route'
import { D } from '../i18n/messages'
import type { GlyphKey } from '../ui/glyphs'
import { ITEM_SPECS, SENSOR_SPECS, groupOf, type CatalogEntry } from './catalog'
import {
  EXTRA_OUTPUT_KINDS,
  type DesignKind,
  type ExtraOutputKind,
  type ItemType,
  type RoomShape,
  type SensorKind,
} from './constants'
import type { Room } from './schema'

/**
 * The three designers share one engine. Every design is one zone — what the
 * Growcast app calls a sala: a grow room, a silo (or a storage cell), a curing
 * room. A kind decides which shapes that zone can take and what can go in it.
 * Equipment and sensor lists follow the client's manual: §5.1 for silos, §5.5
 * for cheese and cured-meat rooms.
 */

export type MountPreset = 'floor' | 'canopy' | 'ceiling'

/** Where a new item goes; x/z left out fall back to the nearest free spot. */
export type Placement = Partial<{ x: number; z: number; y: number }>

export type KindSpec = {
  path: string
  /** mark in the designer switch */
  glyph: GlyphKey
  /** zone shapes this designer offers */
  shapes: readonly RoomShape[]
  limits: { side: readonly [number, number]; height: readonly [number, number] }
  room: { shape: RoomShape; width: number; length: number; height: number }
  /** name of the tab a fresh designer opens with */
  firstName: string
  /** file name when the design has no usable name */
  fileSlug: string
  structures: readonly ItemType[]
  equipment: readonly ItemType[]
  sensors: readonly SensorKind[]
  extras: readonly ExtraOutputKind[]
  mountPresets: readonly MountPreset[]
  /** mounted items may sit on top of the zone — on a silo's roof — not only under its ceiling */
  onTop: boolean
  place?: (type: ItemType, sensorKind: SensorKind | undefined, room: Room) => Placement
  text: {
    nav: MessageDescriptor
    kicker: MessageDescriptor
    docTitle: MessageDescriptor
    roomTitle: MessageDescriptor
    roomHint: MessageDescriptor
    addHint: MessageDescriptor
    defaultName: MessageDescriptor
    notesPh: MessageDescriptor
    extrasHint: MessageDescriptor
    waIntro: MessageDescriptor
    waRoom: MessageDescriptor
  }
}

export const KINDS: Record<DesignKind, KindSpec> = {
  grow: {
    path: DESIGNER_PATHS.grow,
    glyph: 'rack',
    shapes: ['box'],
    limits: { side: [1, 100], height: [2, 12] },
    room: { shape: 'box', width: 6, length: 4, height: 3 },
    firstName: 'Sala 1',
    fileSlug: 'sala',
    structures: ['rack', 'table'],
    equipment: ['light', 'climate', 'fan', 'humidifier'],
    sensors: ['air_temp_humidity', 'co2', 'substrate_moisture_ec', 'water_ph_ec', 'light_par'],
    extras: EXTRA_OUTPUT_KINDS,
    mountPresets: ['floor', 'canopy', 'ceiling'],
    onTop: false,
    text: {
      nav: D.kindNavGrow,
      kicker: D.kicker,
      docTitle: D.docTitle,
      roomTitle: D.roomTitle,
      roomHint: D.roomHint,
      addHint: D.addHint,
      defaultName: D.defaultName,
      notesPh: D.cNotesPh,
      extrasHint: D.extrasHint,
      waIntro: D.waIntro,
      waRoom: D.waRoom,
    },
  },
  silo: {
    path: DESIGNER_PATHS.silo,
    glyph: 'silo',
    shapes: ['round', 'box'],
    limits: { side: [2, 60], height: [2, 60] },
    room: { shape: 'round', width: 8, length: 8, height: 15 },
    firstName: 'Silo 1',
    fileSlug: 'silo',
    structures: [],
    equipment: ['aerator', 'extractor'],
    sensors: ['interior_temp_humidity', 'co2', 'outdoor_temp_humidity'],
    extras: ['other'],
    mountPresets: ['floor', 'ceiling'],
    onTop: true,
    // extractors go on the roof; sensors inside at working heights, the CO₂ one
    // high up; the outdoor one on the roof, off the peak the extractor takes.
    // An infinite y is clamped to the roof surface over that spot.
    place: (type, sensorKind, room) => {
      if (type === 'extractor') return { y: Infinity }
      if (type !== 'sensor') return {}
      if (sensorKind === 'outdoor_temp_humidity') return { x: room.width * 0.25, z: 0, y: Infinity }
      return { y: room.height * (sensorKind === 'co2' ? 0.85 : 0.5) }
    },
    text: {
      nav: D.kindNavSilo,
      kicker: D.kickerSilo,
      docTitle: D.docTitleSilo,
      roomTitle: D.roomTitleSilo,
      roomHint: D.roomHint,
      addHint: D.addHint,
      defaultName: D.defaultNameSilo,
      notesPh: D.cNotesPhSilo,
      extrasHint: D.extrasHintOther,
      waIntro: D.waIntroSilo,
      waRoom: D.waRoomSilo,
    },
  },
  curing: {
    path: DESIGNER_PATHS.curing,
    glyph: 'cheese',
    shapes: ['box'],
    limits: { side: [1, 100], height: [2, 12] },
    room: { shape: 'box', width: 5, length: 4, height: 3 },
    firstName: 'Cámara 1',
    fileSlug: 'camara',
    structures: ['cheese_rack', 'hanger', 'pallet', 'trolley'],
    equipment: ['cooler', 'heater', 'humidifier', 'dehumidifier', 'fan', 'extractor'],
    sensors: ['air_temp_humidity', 'co2'],
    extras: ['other'],
    mountPresets: ['floor', 'ceiling'],
    onTop: false,
    text: {
      nav: D.kindNavCuring,
      kicker: D.kickerCuring,
      docTitle: D.docTitleCuring,
      roomTitle: D.roomTitleCuring,
      roomHint: D.roomHint,
      addHint: D.addHint,
      defaultName: D.defaultNameCuring,
      notesPh: D.cNotesPhCuring,
      extrasHint: D.extrasHintOther,
      waIntro: D.waIntroCuring,
      waRoom: D.waRoomCuring,
    },
  },
}

export const allowsItem = (k: KindSpec, it: { type: ItemType; sensorKind?: SensorKind }) =>
  it.type === 'sensor'
    ? it.sensorKind === undefined || k.sensors.includes(it.sensorKind)
    : k.structures.includes(it.type) || k.equipment.includes(it.type)

export const allowsExtra = (k: KindSpec, e: ExtraOutputKind) => k.extras.includes(e)

function entriesFor(k: KindSpec): CatalogEntry[] {
  return [
    ...[...k.structures, ...k.equipment].map((type) => ({
      key: type,
      group: groupOf(type),
      type,
      label: ITEM_SPECS[type].label,
      glyph: ITEM_SPECS[type].glyph,
    })),
    ...k.sensors.map((s) => ({
      key: `sensor:${s}`,
      group: 'sensor' as const,
      type: 'sensor' as const,
      sensorKind: s,
      label: SENSOR_SPECS[s].label,
      glyph: SENSOR_SPECS[s].glyph,
      tint: SENSOR_SPECS[s].tint,
    })),
  ]
}

export const CATALOGS: Record<DesignKind, readonly CatalogEntry[]> = {
  grow: entriesFor(KINDS.grow),
  silo: entriesFor(KINDS.silo),
  curing: entriesFor(KINDS.curing),
}
