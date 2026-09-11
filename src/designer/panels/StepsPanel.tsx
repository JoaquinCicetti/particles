import { useState, type ReactNode } from 'react'
import { useIntl, type MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import { EQUIPMENT_TYPES, STRUCTURE_TYPES } from '../model/catalog'
import type { ItemType } from '../model/schema'
import { useActiveDesign } from '../store'
import Glyph from '../ui/Glyph'
import { ContactSection, ExtraOutputsSection, LibrarySection, RoomSection, SensorSection } from './sections'

type StepKey = 'room' | 'structure' | 'equipment' | 'sensors' | 'extra' | 'contact'

const STEPS: Array<{ key: StepKey; title: MessageDescriptor; hint: MessageDescriptor; body: ReactNode }> = [
  { key: 'room', title: D.step1, hint: D.step1Hint, body: <RoomSection /> },
  { key: 'structure', title: D.step2, hint: D.step2Hint, body: <LibrarySection types={STRUCTURE_TYPES} /> },
  { key: 'equipment', title: D.step3, hint: D.step3Hint, body: <LibrarySection types={EQUIPMENT_TYPES} /> },
  { key: 'sensors', title: D.step4, hint: D.step4Hint, body: <SensorSection /> },
  { key: 'extra', title: D.step5, hint: D.step5Hint, body: <ExtraOutputsSection /> },
  { key: 'contact', title: D.step6, hint: D.step6Hint, body: <ContactSection /> },
]

/** The numbered build flow: room → racks → equipment → sensors → outputs → contact. */
export default function StepsPanel() {
  const intl = useIntl()
  const d = useActiveDesign()
  const [open, setOpen] = useState<Record<StepKey, boolean>>({
    room: true,
    structure: true,
    equipment: true,
    sensors: true,
    extra: false,
    contact: false,
  })

  const count = (types: readonly ItemType[]) => d.items.filter((i) => types.includes(i.type)).length
  const counts: Partial<Record<StepKey, number>> = {
    structure: count(STRUCTURE_TYPES),
    equipment: count(EQUIPMENT_TYPES),
    sensors: count(['sensor']),
    extra: d.extraOutputs.reduce((n, e) => n + e.quantity, 0),
  }

  return (
    <div className="dz-steps">
      {STEPS.map((s, i) => (
        <section key={s.key} className={`dz-step${open[s.key] ? ' is-open' : ''}`}>
          <h2 className="dz-step-h">
            <button
              type="button"
              className="dz-step-head"
              aria-expanded={open[s.key]}
              onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
            >
              <span className="dz-step-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="dz-step-title">{intl.formatMessage(s.title)}</span>
              {counts[s.key] ? <span className="dz-count">{counts[s.key]}</span> : null}
              <Glyph name="chevron" className="dz-glyph dz-chev" />
            </button>
          </h2>
          {open[s.key] && (
            <div className="dz-step-body">
              <p className="dz-hint">{intl.formatMessage(s.hint)}</p>
              {s.body}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
