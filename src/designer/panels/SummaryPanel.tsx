import { useMemo, type CSSProperties } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { useHandoff } from '../actions'
import { EXTRA_SPECS, ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { CONTROLLABLE_TYPES, EXTRA_OUTPUT_KINDS, SENSOR_KINDS } from '../model/schema'
import { computeSummary } from '../model/summary'
import { fmt } from '../labels'
import { useActiveDesign } from '../store'
import Glyph from '../ui/Glyph'

/** Live quote totals — recomputed from the design on every change. */
export default function SummaryPanel() {
  const intl = useIntl()
  const t = intl.formatMessage
  const d = useActiveDesign()
  const s = useMemo(() => computeSummary(d), [d])
  const { send } = useHandoff()

  const sensorRows = SENSOR_KINDS.filter((k) => s.sensors[k] > 0)
  const outputRows = [
    ...CONTROLLABLE_TYPES.filter((k) => s.placedOutputs[k] > 0).map((k) => ({
      key: k,
      label: t(ITEM_SPECS[k].label),
      glyph: ITEM_SPECS[k].glyph,
      n: s.placedOutputs[k],
      extra: false,
    })),
    ...EXTRA_OUTPUT_KINDS.filter((k) => s.extraOutputs[k] > 0).map((k) => ({
      key: `x-${k}`,
      label: t(EXTRA_SPECS[k].label),
      glyph: EXTRA_SPECS[k].glyph,
      n: s.extraOutputs[k],
      extra: true,
    })),
  ]

  return (
    <section className="dz-summary">
      <span className="metric-label">{t(D.summary)}</span>
      <div className="dz-totals">
        <div className="dz-total">
          <span className="metric-value">{s.totalSensors}</span>
          <span className="dz-total-lbl">{t(D.sensorsTotal)}</span>
        </div>
        <div className="dz-total">
          <span className="metric-value">{s.totalOutputs}</span>
          <span className="dz-total-lbl">{t(D.outputsTotal)}</span>
        </div>
      </div>

      <h4 className="dz-sum-h">{t(D.sensorsByKind)}</h4>
      {sensorRows.length ? (
        <ul className="dz-sum-list">
          {sensorRows.map((k) => (
            <li key={k} style={{ '--tint': SENSOR_SPECS[k].tint } as CSSProperties}>
              <Glyph name={SENSOR_SPECS[k].glyph} />
              <span>{t(SENSOR_SPECS[k].label)}</span>
              <b>{s.sensors[k]}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dz-empty">{t(D.none)}</p>
      )}

      <h4 className="dz-sum-h">{t(D.outputsByKind)}</h4>
      {outputRows.length ? (
        <ul className="dz-sum-list">
          {outputRows.map((r) => (
            <li key={r.key}>
              <Glyph name={r.glyph} />
              <span>
                {r.label}
                {r.extra && <i className="dz-tag">{t(D.extraTag)}</i>}
              </span>
              <b>{r.n}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dz-empty">{t(D.none)}</p>
      )}

      <p className="dz-sum-meta">
        {fmt(s.area, 1)} m² · {t(D.structures, { racks: s.racks, tables: s.tables })}
      </p>
      <button type="button" className="cta dz-send" onClick={send}>
        <span className="cta-label">{t(D.sendBtn)}</span>
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </button>
      <p className="dz-hint dz-hint-sm">{t(D.summaryNote)}</p>
    </section>
  )
}
