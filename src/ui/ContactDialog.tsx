import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { M } from '../i18n/messages'

// Growcast Agro WhatsApp line (Rosario, +54 9 341 …)
const WHATSAPP = '5493412753179'

export default function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const intl = useIntl()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState(() => intl.formatMessage(M.dialogDefaultMsg))
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const send = () => {
    const prefix = name.trim() ? intl.formatMessage(M.dialogNamePrefix, { name: name.trim() }) : ''
    const text = prefix + msg.trim()
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={intl.formatMessage(M.dialogAria)}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label={intl.formatMessage(M.dialogClose)}>
          ×
        </button>
        <span className="kicker">
          <FormattedMessage {...M.dialogKicker} />
        </span>
        <h3 className="dialog-title">
          <FormattedMessage {...M.dialogTitle} />
        </h3>
        <p className="dialog-sub">
          <FormattedMessage {...M.dialogSub} />
        </p>

        <label className="dialog-field">
          <span>
            <FormattedMessage {...M.dialogNameLabel} />
          </span>
          <input
            ref={firstRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={intl.formatMessage(M.dialogNamePlaceholder)}
          />
        </label>

        <label className="dialog-field">
          <span>
            <FormattedMessage {...M.dialogMsgLabel} />
          </span>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
        </label>

        <button type="button" className="cta dialog-send" onClick={send}>
          <span className="cta-label">
            <FormattedMessage {...M.dialogSend} />
          </span>
        </button>
      </div>
    </div>
  )
}
