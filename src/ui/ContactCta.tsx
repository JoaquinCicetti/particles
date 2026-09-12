import { FormattedMessage } from 'react-intl'
import { M } from '../i18n/messages'

type Props = {
  onClick: () => void
  /** `nav` = compact outline button in the header; `block` = large copper button. */
  variant?: 'nav' | 'block'
}

/**
 * The one contact call to action. Every instance opens the same dialog and
 * ends at the same WhatsApp line, so they share a single label (`cta.contact`)
 * — the header form is uppercased by CSS, not by a separate string.
 */
export default function ContactCta({ onClick, variant = 'block' }: Props) {
  if (variant === 'nav')
    return (
      <button type="button" className="nav-cta" onClick={onClick}>
        <FormattedMessage {...M.ctaContact} />
      </button>
    )

  return (
    <button type="button" className="cta" onClick={onClick}>
      <span className="cta-label">
        <FormattedMessage {...M.ctaContact} />
      </span>
      <span className="cta-arrow" aria-hidden>
        →
      </span>
    </button>
  )
}
