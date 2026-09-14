import { useState, type CSSProperties, type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { EXTRA_SPECS, ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { KINDS } from '../model/kinds'
import type { ExtraOutputKind, Item } from '../model/schema'
import { fmt, glyphOf, itemTitle } from '../labels'
import { useActiveDesign, useDesigner } from '../store'
import Glyph from '../ui/Glyph'
import NumberField from '../ui/NumberField'
import Segmented from '../ui/Segmented'
import Stepper from '../ui/Stepper'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="dz-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

// ── room ─────────────────────────────────────────────────────────

export function RoomSection() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const updateRoom = useDesigner((s) => s.updateRoom)
  const setName = useDesigner((s) => s.setName)
  const [name, setNameDraft] = useState<string | null>(null)
  const { width, length, height, shape } = d.room
  const kind = KINDS[d.roomKind]
  const [sideMin, sideMax] = kind.limits.side
  const round = shape === 'round'
  const area = round ? Math.PI * (width / 2) ** 2 : width * length

  return (
    <div className="dz-stack">
      <Field label={t(D.roomName)}>
        <input
          className="dz-input"
          value={name ?? d.name}
          maxLength={80}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => {
            if (name !== null) setName(name)
            setNameDraft(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
        />
      </Field>
      {/* a silo zone is round; the same designer also covers storage cells */}
      {kind.shapes.length > 1 && (
        <Segmented
          label={t(D.shapeAria)}
          value={shape}
          onChange={(next) => updateRoom({ shape: next })}
          options={kind.shapes.map((s) => ({
            value: s,
            label: (
              <>
                <Glyph name={s === 'round' ? 'silo' : 'cell'} />
                {t(s === 'round' ? D.shapeRound : D.shapeBox)}
              </>
            ),
          }))}
        />
      )}
      <div className={round ? 'dz-grid2' : 'dz-grid3'}>
        <NumberField
          label={t(round ? D.diameter : D.width)}
          value={width}
          min={sideMin}
          max={sideMax}
          onChange={(v) => updateRoom(round ? { width: v, length: v } : { width: v })}
        />
        {!round && (
          <NumberField label={t(D.length)} value={length} min={sideMin} max={sideMax} onChange={(v) => updateRoom({ length: v })} />
        )}
        <NumberField
          label={t(D.height)}
          value={height}
          min={kind.limits.height[0]}
          max={kind.limits.height[1]}
          onChange={(v) => updateRoom({ height: v })}
        />
      </div>
      <div className="dz-roomstats">
        <div>
          <span>{t(D.area)}</span>
          <b>{fmt(area, 1)} m²</b>
        </div>
        <div>
          <span>{t(D.volume)}</span>
          <b>{fmt(area * height, 1)} m³</b>
        </div>
      </div>
    </div>
  )
}

// ── placed-item lists ────────────────────────────────────────────

function meta(it: Item) {
  const spec = ITEM_SPECS[it.type]
  if (it.type === 'light' || (spec.resizable && spec.mount === 'floor')) return `${fmt(it.width)}×${fmt(it.depth)}`
  if (it.y !== undefined) return `↕ ${fmt(it.y)} m`
  return ''
}

export function ItemList({ filter }: { filter: (it: Item) => boolean }) {
  const intl = useIntl()
  const d = useActiveDesign()
  const selectedId = useDesigner((s) => s.selectedId)
  const items = d.items.filter(filter)
  if (!items.length) return <p className="dz-empty">{intl.formatMessage(D.empty)}</p>
  return (
    <ul className="dz-list">
      {items.map((it) => {
        const title = itemTitle(intl, it, d.items)
        const tint = it.type === 'sensor' && it.sensorKind ? SENSOR_SPECS[it.sensorKind].tint : undefined
        return (
          <li
            key={it.id}
            className={`dz-row${it.id === selectedId ? ' is-selected' : ''}`}
            style={tint ? ({ '--tint': tint } as CSSProperties) : undefined}
          >
            <button type="button" className="dz-row-main" onClick={() => useDesigner.getState().select(it.id)}>
              <Glyph name={glyphOf(it)} />
              <span className="dz-row-name">{title}</span>
              <span className="dz-row-meta">
                {meta(it)}
                {it.outputs !== undefined && <em>{it.outputs} OUT</em>}
              </span>
            </button>
            <button
              type="button"
              className="dz-row-del"
              aria-label={`${intl.formatMessage(D.delete)} ${title}`}
              title={intl.formatMessage(D.delete)}
              onClick={() => useDesigner.getState().removeItem(it.id)}
            >
              <Glyph name="close" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ── extra outputs (finish step) ──────────────────────────────────

export function ExtraOutputsSection() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const addExtra = useDesigner((s) => s.addExtra)
  const updateExtra = useDesigner((s) => s.updateExtra)
  const removeExtra = useDesigner((s) => s.removeExtra)
  const kinds = KINDS[d.roomKind].extras

  return (
    <div className="dz-stack">
      <div className="dz-chips" role="group" aria-label={t(D.extraQuickAdd)}>
        {kinds.map((k) => (
          <button key={k} type="button" className="dz-chip" onClick={() => addExtra(k)}>
            <Glyph name={EXTRA_SPECS[k].glyph} />
            {t(EXTRA_SPECS[k].label)}
          </button>
        ))}
      </div>
      {d.extraOutputs.length === 0 ? (
        <p className="dz-empty">{t(D.extraEmpty)}</p>
      ) : (
        <ul className="dz-extras">
          {d.extraOutputs.map((e, i) => (
            <li key={i} className="dz-extra">
              <div className="dz-extra-top">
                <select
                  className="dz-select"
                  value={e.kind}
                  aria-label={t(D.extrasTitle)}
                  onChange={(ev) => updateExtra(i, { kind: ev.target.value as ExtraOutputKind })}
                >
                  {kinds.map((k) => (
                    <option key={k} value={k}>
                      {t(EXTRA_SPECS[k].label)}
                    </option>
                  ))}
                </select>
                <Stepper value={e.quantity} min={0} max={999} label={t(D.extraQty)} onChange={(q) => updateExtra(i, { quantity: q })} />
                <button
                  type="button"
                  className="dz-row-del is-visible"
                  aria-label={t(D.remove)}
                  title={t(D.remove)}
                  onClick={() => removeExtra(i)}
                >
                  <Glyph name="close" />
                </button>
              </div>
              <input
                className="dz-input dz-input-sm"
                value={e.note}
                maxLength={200}
                placeholder={t(D.extraNotePh)}
                onChange={(ev) => updateExtra(i, { note: ev.target.value }, false)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── contact (finish step) ────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactSection() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const c = d.contact
  const setContact = useDesigner((s) => s.setContact)
  const emailBad = c.email.trim() !== '' && !EMAIL_RE.test(c.email.trim())

  return (
    <div className="dz-stack">
      <Field label={t(D.cName)}>
        <input
          className="dz-input"
          value={c.name}
          maxLength={120}
          autoComplete="name"
          placeholder={t(D.cNamePh)}
          onChange={(e) => setContact({ name: e.target.value })}
        />
      </Field>
      <Field label={t(D.cEmail)}>
        <input
          className={`dz-input${emailBad ? ' is-invalid' : ''}`}
          type="email"
          value={c.email}
          maxLength={160}
          autoComplete="email"
          aria-invalid={emailBad}
          onChange={(e) => setContact({ email: e.target.value })}
        />
        {emailBad && <em className="dz-warn">{t(D.cEmailInvalid)}</em>}
      </Field>
      <div className="dz-grid2">
        <Field label={t(D.cPhone)}>
          <input
            className="dz-input"
            type="tel"
            value={c.phone}
            maxLength={40}
            autoComplete="tel"
            onChange={(e) => setContact({ phone: e.target.value })}
          />
        </Field>
        <Field label={t(D.cLocation)}>
          <input
            className="dz-input"
            value={c.location}
            maxLength={160}
            autoComplete="address-level2"
            placeholder={t(D.cLocationPh)}
            onChange={(e) => setContact({ location: e.target.value })}
          />
        </Field>
      </div>
      <Field label={t(D.cNotes)}>
        <textarea
          className="dz-input"
          rows={4}
          value={c.notes}
          maxLength={4000}
          placeholder={t(KINDS[d.roomKind].text.notesPh)}
          onChange={(e) => setContact({ notes: e.target.value })}
        />
      </Field>
    </div>
  )
}
