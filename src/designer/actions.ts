import { useMemo } from 'react'
import { useIntl, type IntlShape } from 'react-intl'
import { whatsappUrl } from '../lib/contact'
import { D } from './i18n/messages'
import { EXTRA_SPECS, ITEM_SPECS, SENSOR_SPECS } from './model/catalog'
import { downloadDesign, readDesignFile } from './model/io'
import { CONTROLLABLE_TYPES, EXTRA_OUTPUT_KINDS, SENSOR_KINDS, type Design } from './model/schema'
import { computeSummary } from './model/summary'
import { getActiveDesign, useDesigner, useUi } from './store'

/** Import: a valid file opens in a new tab; anything else shows why, loads nothing. */
export async function openDesignFile(file: File, intl: IntlShape) {
  const res = await readDesignFile(file)
  const ui = useUi.getState()
  if (!res.ok) {
    ui.setImportError(res)
    return
  }
  useDesigner.getState().importDesign(res.design)
  ui.showToast(intl.formatMessage(D.toastImported, { name: res.design.name }))
}

const num = (n: number) => String(Math.round(n * 100) / 100)

/** Plain-text summary for the WhatsApp hand-off (the file carries the detail). */
export function whatsappText(intl: IntlShape, d: Design, file: string) {
  const s = computeSummary(d)
  const t = intl.formatMessage
  const lines = [
    t(D.waIntro, { name: d.name }),
    '',
    t(D.waRoom, { w: num(d.room.width), l: num(d.room.length), h: num(d.room.height), area: num(s.area) }),
    t(D.waSensors, { n: s.totalSensors }),
  ]
  for (const k of SENSOR_KINDS) if (s.sensors[k]) lines.push(`  • ${s.sensors[k]} × ${t(SENSOR_SPECS[k].label)}`)
  lines.push(t(D.waOutputs, { n: s.totalOutputs }))
  for (const k of CONTROLLABLE_TYPES)
    if (s.placedOutputs[k]) lines.push(`  • ${s.placedOutputs[k]} × ${t(ITEM_SPECS[k].label)}`)
  for (const k of EXTRA_OUTPUT_KINDS)
    if (s.extraOutputs[k]) lines.push(`  • ${s.extraOutputs[k]} × ${t(EXTRA_SPECS[k].label)}`)
  const who = [d.contact.name, d.contact.location]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(' — ')
  if (who) lines.push(t(D.waContact, { who }))
  lines.push('', t(D.waAttach, { file }))
  return lines.join('\n')
}

export function useHandoff() {
  const intl = useIntl()
  return useMemo(
    () => ({
      exportFile: () => {
        const file = downloadDesign(getActiveDesign())
        useUi.getState().showToast(intl.formatMessage(D.toastExported, { file }))
      },
      send: () => {
        const d = getActiveDesign()
        const file = downloadDesign(d)
        window.open(whatsappUrl(whatsappText(intl, d, file)), '_blank', 'noopener,noreferrer')
        useUi.getState().showToast(intl.formatMessage(D.toastSent))
      },
    }),
    [intl],
  )
}
