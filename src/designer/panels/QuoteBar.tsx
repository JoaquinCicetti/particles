import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { computeSummary } from '../model/summary'
import { useActiveDesign } from '../store'

/**
 * Running totals pinned to the foot of the properties column: enough to watch
 * the quote grow while designing, without the full breakdown competing with
 * the item being edited. A readout, not an action — Finish lives in the top
 * bar beside Import, so there is one way out and one way in.
 */
export default function QuoteBar() {
  const t = useIntl().formatMessage
  const d = useActiveDesign()
  const s = useMemo(() => computeSummary(d), [d])

  return (
    <div className="dz-quotebar" role="status">
      <div className="dz-totals">
        <div className="dz-total">
          <b>{s.totalSensors}</b>
          <span>{t(D.sensorsTotal)}</span>
        </div>
        <div className="dz-total">
          <b>{s.totalOutputs}</b>
          <span>{t(D.outputsTotal)}</span>
        </div>
        <div className="dz-total">
          <b>{s.totalDevices}</b>
          <span>{t(D.devicesTotal)}</span>
        </div>
      </div>
    </div>
  )
}
