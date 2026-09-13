import { useCallback } from 'react'
import { useIntl, type MessageDescriptor } from 'react-intl'
import { D } from '../i18n/messages'
import type { IssueCode } from '../model/schema'
import { useUi, type ImportFailure } from '../store'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const REASON: Record<ImportFailure['reason'], MessageDescriptor> = {
  json: D.errJson,
  format: D.errFormat,
  version: D.errVersion,
  schema: D.errSchema,
  size: D.errSize,
}

const ISSUE: Record<IssueCode, MessageDescriptor> = {
  type: D.isType,
  range: D.isRange,
  required: D.isRequired,
  not_allowed: D.isNotAllowed,
  outside: D.isOutside,
  duplicate: D.isDuplicate,
  invalid: D.isInvalid,
}

const SHOWN = 8

export default function ImportErrorDialog() {
  const intl = useIntl()
  const t = intl.formatMessage
  const err = useUi((s) => s.importError)
  const setErr = useUi((s) => s.setImportError)
  const close = useCallback(() => setErr(null), [setErr])

  return (
    <Dialog open={!!err} onOpenChange={(o) => !o && close()}>
      <DialogContent className="dz-dialog">
        <span className="kicker">{t(D.kicker)}</span>
        <DialogTitle className="dialog-title">{t(D.errTitle)}</DialogTitle>
        {err && (
          <>
            <p className="dialog-sub">{t(REASON[err.reason], { version: String(err.version ?? '—') })}</p>
            {err.issues.length > 0 && (
              <ul className="dz-issues">
                {err.issues.slice(0, SHOWN).map((is, i) => (
                  <li key={i}>
                    <code>{is.path}</code>
                    <span>{t(ISSUE[is.code])}</span>
                  </li>
                ))}
              </ul>
            )}
            {err.issues.length > SHOWN && <p className="dz-hint">{t(D.errMore, { n: err.issues.length - SHOWN })}</p>}
          </>
        )}
        <button type="button" className="cta dialog-send" autoFocus onClick={close}>
          <span className="cta-label">{t(D.ok)}</span>
        </button>
      </DialogContent>
    </Dialog>
  )
}
