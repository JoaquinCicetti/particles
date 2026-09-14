import { useMemo } from 'react'
import { useIntl, type IntlShape } from 'react-intl'
import { whatsappUrl } from '../lib/contact'
import { navigate } from '../lib/route'
import { D } from './i18n/messages'
import { EXTRA_SPECS, ITEM_SPECS, SENSOR_SPECS } from './model/catalog'
import { downloadDesign, readDesignFile } from './model/io'
import { KINDS } from './model/kinds'
import { CONTROLLABLE_TYPES, GROWCAST_TYPES, isStructure, type Design } from './model/schema'
import { computeSummary } from './model/summary'
import { getActiveDesign, useDesigner, useUi } from './store'

/**
 * Import: a valid file opens in a new tab — in its own designer, so a silo
 * plant dropped on the grow-room page takes you to the silo page — and
 * anything else shows why and loads nothing.
 */
export async function openDesignFile(file: File, intl: IntlShape) {
  const res = await readDesignFile(file)
  const ui = useUi.getState()
  if (!res.ok) {
    ui.setImportError(res)
    return
  }
  const store = useDesigner.getState()
  store.importDesign(res.design)
  if (res.design.roomKind !== store.kind) navigate(KINDS[res.design.roomKind].path)
  ui.showToast(intl.formatMessage(D.toastImported, { name: res.design.name }))
}

const num = (n: number) => String(Math.round(n * 100) / 100)

/** Plain-text summary for the WhatsApp hand-off (the file carries the detail). */
export function whatsappText(intl: IntlShape, d: Design, file: string) {
  const s = computeSummary(d)
  const t = intl.formatMessage
  const kind = KINDS[d.roomKind]
  const lines = [
    t(kind.text.waIntro, { name: d.name }),
    '',
    t(d.room.shape === 'round' ? D.waRoomRound : kind.text.waRoom, { w: num(d.room.width), l: num(d.room.length), h: num(d.room.height), area: num(s.area) }),
  ]
  const structures = kind.structures.filter(isStructure).filter((k) => s.structures[k])
  if (structures.length) {
    lines.push(t(D.waStructures, { n: structures.reduce((n, k) => n + s.structures[k], 0) }))
    for (const k of structures) lines.push(`  • ${s.structures[k]} × ${t(ITEM_SPECS[k].label)}`)
  }
  if (s.totalDevices) {
    lines.push(t(D.waDevices, { n: s.totalDevices }))
    for (const k of GROWCAST_TYPES) if (s.devices[k]) lines.push(`  • ${s.devices[k]} × ${t(ITEM_SPECS[k].label)}`)
  }
  lines.push(t(D.waSensors, { n: s.totalSensors }))
  for (const k of kind.sensors) if (s.sensors[k]) lines.push(`  • ${s.sensors[k]} × ${t(SENSOR_SPECS[k].label)}`)
  lines.push(t(D.waOutputs, { n: s.totalOutputs }))
  for (const k of CONTROLLABLE_TYPES)
    if (s.placedOutputs[k]) lines.push(`  • ${s.placedOutputs[k]} × ${t(ITEM_SPECS[k].label)}`)
  for (const k of kind.extras) if (s.extraOutputs[k]) lines.push(`  • ${s.extraOutputs[k]} × ${t(EXTRA_SPECS[k].label)}`)
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
