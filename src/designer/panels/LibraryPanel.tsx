import { useMemo, useState, type CSSProperties } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { CATALOG, groupOf, type CatalogGroup } from '../model/catalog'
import { useActiveDesign, useDesigner } from '../store'
import Glyph from '../ui/Glyph'
import { ItemList, RoomSection } from './sections'

type Filter = 'all' | CatalogGroup

const FILTERS: Array<{ value: Filter; label: typeof D.filterAll }> = [
  { value: 'all', label: D.filterAll },
  { value: 'structure', label: D.filterStructure },
  { value: 'equipment', label: D.filterEquipment },
  { value: 'sensor', label: D.filterSensor },
]

/** Accent-insensitive contains, so "humedad" finds "Humedad / EC". */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * The design side of the tool: room dimensions, then one filterable palette of
 * everything placeable, then what is already in the room. The same filter
 * drives both lists, so picking "Sensors" narrows the palette and the
 * inventory together.
 */
export default function LibraryPanel() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const addItem = useDesigner((s) => s.addItem)
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')

  const needle = fold(q.trim())
  const entries = useMemo(
    () =>
      CATALOG.filter((e) => filter === 'all' || e.group === filter).filter(
        (e) => !needle || fold(t(e.label)).includes(needle),
      ),
    [filter, needle, t],
  )

  const placed = d.items.filter((it) => filter === 'all' || groupOf(it.type) === filter)

  return (
    <div className="dz-lib-panel">
      <section className="dz-block">
        <h2 className="dz-block-h">{t(D.roomTitle)}</h2>
        <p className="dz-hint dz-hint-sm">{t(D.roomHint)}</p>
        <RoomSection />
      </section>

      <section className="dz-block">
        <h2 className="dz-block-h">{t(D.addTitle)}</h2>

        <div className="dz-filters" role="group" aria-label={t(D.filterAria)}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              className={`dz-filter${filter === f.value ? ' is-on' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        <input
          className="dz-input dz-search"
          type="search"
          value={q}
          placeholder={t(D.searchPh)}
          aria-label={t(D.searchPh)}
          onChange={(e) => setQ(e.target.value)}
        />

        {entries.length ? (
          <div className="dz-palette">
            {entries.map((e) => (
              <button
                key={e.key}
                type="button"
                className="dz-lib-btn"
                style={e.tint ? ({ '--tint': e.tint } as CSSProperties) : undefined}
                onClick={() => addItem(e.type, e.sensorKind)}
              >
                <Glyph name={e.glyph} />
                <span>{t(e.label)}</span>
                <Glyph name="plus" className="dz-glyph dz-lib-plus" />
              </button>
            ))}
          </div>
        ) : (
          <p className="dz-empty">{t(D.noMatches)}</p>
        )}
        <p className="dz-hint dz-hint-sm">{t(D.addHint)}</p>
      </section>

      <section className="dz-block">
        <h2 className="dz-block-h">
          {t(D.inRoom)}
          {placed.length > 0 && <span className="dz-count">{placed.length}</span>}
        </h2>
        <ItemList filter={(it) => filter === 'all' || groupOf(it.type) === filter} />
      </section>
    </div>
  )
}
