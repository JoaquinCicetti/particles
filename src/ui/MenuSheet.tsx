import { useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { NAV, onAnchorClick } from './nav'

/** Mobile menu: same shell as the contact dialog, four large section links. */
export default function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const intl = useIntl()
  const firstRef = useRef<HTMLAnchorElement>(null)

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

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog sheet"
        role="dialog"
        aria-modal="true"
        aria-label={intl.formatMessage(M.navMenu)}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label={intl.formatMessage(M.dialogClose)}>
          ×
        </button>
        <span className="kicker">GROWCAST AGRO</span>
        <nav className="sheet-list">
          {NAV.map((n, i) => (
            <a
              key={n.id}
              ref={i === 0 ? firstRef : undefined}
              href={`#${n.id}`}
              className="sheet-link"
              onClick={(e) => {
                onClose()
                onAnchorClick(e)
              }}
            >
              <span className="sheet-num">0{i + 1}</span>
              {intl.formatMessage(n.msg)}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
