import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { ACTS } from '../lib/acts'

/**
 * Prev/next through the five acts, with an "02 / 05" readout.
 *
 * PRESENTATIONAL ONLY — no state, no effects, never re-renders with scroll.
 * Overlay binds the two buttons once in its mount effect and rewrites the
 * label from inside the single rAF loop, change-guarded, exactly like the
 * phase ticker. Everything here is markup.
 */
export default function Stepper() {
  const intl = useIntl()
  const total = String(ACTS.length).padStart(2, '0')

  return (
    <div className="stepper" data-stepper>
      <button
        type="button"
        className="stepper-btn"
        data-step-prev
        aria-label={intl.formatMessage(M.stepPrev)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4 9.5 8 5.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="stepper-label" data-step-label aria-hidden>
        {`01 / ${total}`}
      </span>
      <button
        type="button"
        className="stepper-btn"
        data-step-next
        aria-label={intl.formatMessage(M.stepNext)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M4 6.5 8 10.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
