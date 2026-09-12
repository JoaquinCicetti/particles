import { useMemo, type CSSProperties } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { useHandoff } from '../actions'
import { EXTRA_SPECS, ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { CONTROLLABLE_TYPES, EXTRA_OUTPUT_KINDS, SENSOR_KINDS } from '../model/schema'
import { computeSummary } from '../model/summary'
import { fmt } from '../labels'
import { useActiveDesign, useUi } from '../store'
import Glyph from '../ui/Glyph'
import Modal from '../ui/Modal'
import { ContactSection, ExtraOutputsSection } from './sections'

/**
 * The export step. Designing is done in the room; this is where the design
 * becomes a quote — totals to check, outputs that were never drawn, and who to
 * reply to — before it leaves as a file or a message.
 */
export default function FinishDialog() {
  const intl = useIntl()
  const t = intl.formatMessage
  const open = useUi((s) => s.finishOpen)
  const setOpen = useUi((s) => s.setFinishOpen)
  const d = useActiveDesign()
  const s = useMemo(() => computeSummary(d), [d])
  const { exportFile, send } = useHandoff()

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
    <Modal open={open} onClose={() => setOpen(false)} label={t(D.finishTitle)} className="dz-finish">
      <h2 className="dialog-title">{t(D.finishTitle)}</h2>
      <p className="dz-hint">{t(D.finishHint)}</p>

      <div className="dz-finish-body">
        <section className="dz-block">
          <h3 className="dz-block-h">{t(D.summary)}</h3>
          <p className="dz-sum-meta">
            {t(D.roomLine, {
              w: fmt(d.room.width, 1),
              l: fmt(d.room.length, 1),
              h: fmt(d.room.height, 1),
              area: fmt(s.area, 1),
            })}
            {' · '}
            {t(D.structures, { racks: s.racks, tables: s.tables })}
          </p>
          <div className="dz-totals">
            <div className="dz-total">
              <b>{s.totalSensors}</b>
              <span>{t(D.sensorsTotal)}</span>
            </div>
            <div className="dz-total">
              <b>{s.totalOutputs}</b>
              <span>{t(D.outputsTotal)}</span>
            </div>
          </div>

          <h4 className="dz-sub-h">{t(D.sensorsByKind)}</h4>
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

          <h4 className="dz-sub-h">{t(D.outputsByKind)}</h4>
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
        </section>

        <section className="dz-block">
          <h3 className="dz-block-h">{t(D.extrasTitle)}</h3>
          <p className="dz-hint dz-hint-sm">{t(D.extrasHint)}</p>
          <ExtraOutputsSection />
        </section>

        <section className="dz-block">
          <h3 className="dz-block-h">{t(D.contactTitle)}</h3>
          <p className="dz-hint dz-hint-sm">{t(D.contactHint)}</p>
          <ContactSection />
        </section>
      </div>

      <div className="dz-modal-actions">
        <button type="button" className="dz-btn" onClick={exportFile} title={t(D.exportHint)}>
          <Glyph name="download" />
          {t(D.downloadBtn)}
        </button>
        <button type="button" className="dz-btn dz-btn-primary" onClick={send} title={t(D.sendHint)}>
          <Glyph name="send" />
          {t(D.sendBtn)}
        </button>
      </div>
      <p className="dz-hint dz-hint-sm">{t(D.summaryNote)}</p>
    </Modal>
  )
}
