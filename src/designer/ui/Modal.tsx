import { useEffect, type ReactNode } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'

/** Same dark card as the landing's contact dialog. */
export default function Modal({
  open,
  onClose,
  label,
  children,
  className = '',
}: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  const intl = useIntl()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="dialog-backdrop dz-modal" onClick={onClose}>
      <div
        className={`dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label={intl.formatMessage(D.close)}>
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
