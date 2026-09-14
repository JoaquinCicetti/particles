import { useEffect, useRef, type MouseEvent } from 'react'
import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import LangPicker from './LangPicker'
import LegalLinks from './LegalLinks'
import { HOME, NAV, onAnchorClick } from './nav'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Mobile menu: same shell as the contact dialog. Home sits on its own above
 *  one large link per section, and the language flags live in its footer. */
export default function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const intl = useIntl()
  const sheet = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const t = setTimeout(() => firstRef.current?.focus(), 30)

    // hold the page behind the sheet still while it is up
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // focus trap: Tab cycles inside the sheet instead of escaping to the page
      const items = Array.from(sheet.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const here = document.activeElement
      const inside = here instanceof Node && sheet.current?.contains(here)
      if (e.shiftKey && (here === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (here === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClose()
    onAnchorClick(e)
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog sheet"
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={intl.formatMessage(M.navMenu)}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label={intl.formatMessage(M.dialogClose)}>
          ×
        </button>
        <span className="kicker">{intl.formatMessage(M.navBrand)}</span>
        <a ref={firstRef} href={`#${HOME.id}`} className="sheet-home" onClick={go}>
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M3.6 10.2 L8 5.8 L12.4 10.2" />
          </svg>
          {intl.formatMessage(HOME.msg)}
        </a>
        <nav className="sheet-list">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} className="sheet-link" onClick={go}>
              <span className="sheet-num">0{i + 1}</span>
              {intl.formatMessage(n.msg)}
            </a>
          ))}
        </nav>
        <LegalLinks className="sheet-legal" />
        <div className="sheet-lang">
          <LangPicker />
        </div>
      </div>
    </div>
  )
}
