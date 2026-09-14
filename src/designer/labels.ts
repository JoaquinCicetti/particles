import type { IntlShape } from 'react-intl'
import { ITEM_SPECS, SENSOR_SPECS } from './model/catalog'
import type { Item } from './model/schema'
import type { GlyphKey } from './ui/glyphs'

export const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'

const typeLabel = (intl: IntlShape, it: Pick<Item, 'type' | 'sensorKind'>) =>
  intl.formatMessage(it.type === 'sensor' && it.sensorKind ? SENSOR_SPECS[it.sensorKind].label : ITEM_SPECS[it.type].label)

/** The custom name, or "Rack 2"-style numbering among its siblings. */
export function itemTitle(intl: IntlShape, it: Item, items: Item[]) {
  const custom = it.name?.trim()
  if (custom) return custom
  const same = items.filter((o) => o.type === it.type && (it.type !== 'sensor' || o.sensorKind === it.sensorKind))
  return `${typeLabel(intl, it)} ${same.findIndex((o) => o.id === it.id) + 1}`
}

export const glyphOf = (it: Pick<Item, 'type' | 'sensorKind'>): GlyphKey =>
  it.type === 'sensor' && it.sensorKind ? SENSOR_SPECS[it.sensorKind].glyph : ITEM_SPECS[it.type].glyph

export const fmt = (v: number, digits = 2) => v.toFixed(digits)
