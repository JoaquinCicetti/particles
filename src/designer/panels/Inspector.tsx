import type { CSSProperties, ReactNode } from 'react'
import { useIntl, type MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import { ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { footprint } from '../model/geometry'
import { SENSOR_KINDS, isControllable, type Item } from '../model/schema'
import { MOD_KEY, glyphOf, itemTitle } from '../labels'
import { useActiveDesign, useDesigner } from '../store'
import Glyph from '../ui/Glyph'
import NumberField from '../ui/NumberField'
import Segmented from '../ui/Segmented'
import Stepper from '../ui/Stepper'

const KEYS: Array<[string[], MessageDescriptor]> = [
  [['←', '↑', '→', '↓'], D.kbMove],
  [['R'], D.kbRotate],
  [[MOD_KEY, 'D'], D.kbDuplicate],
  [['⌫'], D.kbDelete],
  [[MOD_KEY, 'Z'], D.kbUndo],
  [['Esc'], D.kbDeselect],
]

const CANOPY = 1.5

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dz-group">
      <span className="dz-group-label">{label}</span>
      {children}
    </div>
  )
}

export default function Inspector() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const selectedId = useDesigner((s) => s.selectedId)
  const it = d.items.find((i) => i.id === selectedId)

  if (!it) {
    return (
      <section className="dz-insp dz-insp-empty">
        <p className="dz-hint">{t(D.inspectorEmpty)}</p>
        <Shortcuts />
      </section>
    )
  }

  const s = useDesigner.getState()
  const spec = ITEM_SPECS[it.type]
  const room = d.room
  const { w, d: dep } = footprint(it)
  const maxY = Math.max(0, room.height - spec.height)
  const up = (patch: Partial<Item>) => s.updateItem(it.id, patch)
  const tint = it.type === 'sensor' && it.sensorKind ? SENSOR_SPECS[it.sensorKind].tint : undefined
  const autoTitle = itemTitle(intl, { ...it, name: undefined }, d.items)

  const presets = { floor: 0, canopy: Math.min(CANOPY, maxY), ceiling: maxY }
  const y = it.y ?? 0
  const preset =
    (Object.keys(presets) as Array<keyof typeof presets>).find((k) => Math.abs(presets[k] - y) < 0.005) ?? null

  return (
    <section className="dz-insp" style={tint ? ({ '--tint': tint } as CSSProperties) : undefined}>
      <header className="dz-insp-head">
        <Glyph name={glyphOf(it)} className="dz-glyph dz-insp-icon" />
        <h3 className="dz-insp-title">{itemTitle(intl, it, d.items)}</h3>
      </header>

      <label className="dz-field">
        <span>{t(D.name)}</span>
        <input
          className="dz-input"
          value={it.name ?? ''}
          placeholder={autoTitle}
          maxLength={80}
          onChange={(e) => s.updateItem(it.id, { name: e.target.value || undefined }, false)}
        />
      </label>

      {it.type === 'sensor' && (
        <Group label={t(D.sensorKind)}>
          <div className="dz-kinds" role="radiogroup" aria-label={t(D.sensorKind)}>
            {SENSOR_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={k === it.sensorKind}
                className={`dz-kind${k === it.sensorKind ? ' is-on' : ''}`}
                style={{ '--tint': SENSOR_SPECS[k].tint } as CSSProperties}
                onClick={() => up({ sensorKind: k })}
              >
                <Glyph name={SENSOR_SPECS[k].glyph} />
                <span>{t(SENSOR_SPECS[k].label)}</span>
              </button>
            ))}
          </div>
        </Group>
      )}

      <Group label={t(D.position)}>
        <div className="dz-grid2">
          <NumberField label="X" value={it.x} min={-(room.width - w) / 2} max={(room.width - w) / 2} onChange={(x) => up({ x })} />
          <NumberField label="Z" value={it.z} min={-(room.length - dep) / 2} max={(room.length - dep) / 2} onChange={(z) => up({ z })} />
        </div>
      </Group>

      {spec.resizable && (
        <Group label={t(D.size)}>
          <div className="dz-grid2">
            <NumberField label={t(D.width)} value={it.width} min={0.1} max={100} onChange={(width) => up({ width })} />
            <NumberField label={t(D.depth)} value={it.depth} min={0.1} max={100} onChange={(depth) => up({ depth })} />
          </div>
        </Group>
      )}

      <Group label={t(D.rotation)}>
        <div className="dz-rot">
          <button
            type="button"
            className="dz-btn dz-icon-btn"
            onClick={() => s.rotateItem(it.id, -1)}
            aria-label={t(D.rotLeft)}
            title={t(D.rotLeft)}
          >
            <Glyph name="rotL" />
          </button>
          <output className="dz-rot-val" aria-live="polite">
            {it.rotation * 90}°
          </output>
          <button
            type="button"
            className="dz-btn dz-icon-btn"
            onClick={() => s.rotateItem(it.id, 1)}
            aria-label={t(D.rotRight)}
            title={t(D.rotRight)}
          >
            <Glyph name="rotR" />
          </button>
        </div>
      </Group>

      {spec.mount === 'mounted' && (
        <Group label={t(D.mount)}>
          <NumberField label="Y" value={y} min={0} max={maxY} onChange={(v) => up({ y: v })} />
          {it.type === 'sensor' && (
            <Segmented
              label={t(D.mount)}
              value={preset}
              onChange={(p) => up({ y: presets[p] })}
              options={[
                { value: 'floor', label: t(D.mountFloor) },
                { value: 'canopy', label: t(D.mountCanopy) },
                { value: 'ceiling', label: t(D.mountCeiling) },
              ]}
            />
          )}
        </Group>
      )}

      {isControllable(it.type) && (
        <Group label={t(D.outputs)}>
          <Stepper value={it.outputs ?? 0} min={0} max={64} label={t(D.outputs)} onChange={(outputs) => up({ outputs })} />
          <p className="dz-hint dz-hint-sm">{t(D.outputsHint)}</p>
        </Group>
      )}

      <div className="dz-insp-actions">
        <button type="button" className="dz-btn" onClick={() => s.duplicateItem(it.id)}>
          <Glyph name="copy" />
          {t(D.duplicate)}
        </button>
        <button type="button" className="dz-btn dz-btn-danger" onClick={() => s.removeItem(it.id)}>
          <Glyph name="trash" />
          {t(D.delete)}
        </button>
      </div>
    </section>
  )
}

/** Keyboard reference — fills the properties slot while nothing is selected. */
function Shortcuts() {
  const t = useIntl().formatMessage
  return (
    <div className="dz-keys">
      <h4 className="dz-sub-h">{t(D.shortcuts)}</h4>
      <dl>
        {KEYS.map(([keys, msg]) => (
          <div key={msg.id}>
            <dt>
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </dt>
            <dd>{t(msg)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
