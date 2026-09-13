import { FormattedMessage, useIntl } from 'react-intl'
import { M } from '../i18n/messages'

type Props = {
  onClick: () => void
  /** `nav` = compact outline button in the header; `block` = large lime button. */
  variant?: 'nav' | 'block'
}

/**
 * The one contact call to action. Every instance opens the same dialog and
 * ends at the same WhatsApp line, so they share a single label (`cta.contact`)
 * — the header form is uppercased by CSS, not by a separate string.
 *
 * The header form carries BOTH a calendar glyph and the label, and CSS shows
 * one or the other: on a phone the sentence ("Coordinar una reunión") is wider
 * than the room left beside the mark, the stepper and the menu, so only the
 * glyph shows. The `aria-label` keeps the full name either way.
 */
export default function ContactCta({ onClick, variant = 'block' }: Props) {
  const intl = useIntl()

  if (variant === 'nav')
    return (
      <button type="button" className="nav-cta" onClick={onClick} aria-label={intl.formatMessage(M.ctaContact)}>
        <svg className="nav-cta-icon" viewBox="0 0 16 16" aria-hidden>
          <rect x="1.9" y="3.1" width="12.2" height="11" rx="1.6" />
          <path d="M1.9 6.5 H14.1 M5.3 1.7 V4.3 M10.7 1.7 V4.3" />
          <path d="M5.6 9.4 H7 M9 9.4 H10.4 M5.6 11.6 H7 M9 11.6 H10.4" />
        </svg>
        <span className="nav-cta-label">
          <FormattedMessage {...M.ctaContact} />
        </span>
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
