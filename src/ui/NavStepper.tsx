import { useIntl } from 'react-intl'
import { scrollToSection } from '../lib/scroll'
import { M } from '../i18n/messages'
import { NAV } from './nav'
import { useActiveSection } from './useActiveSection'

/**
 * Prev / next footer for the side index. The page is a sequence — the 3D
 * story, then the three solutions, then contact — so the index that names the
 * steps also offers a control to walk them, one press at a time, on the same
 * eased glide its links use.
 *
 * Mounted twice: in the side index footer on a desktop, and on its own as a
 * floating control on a phone — where the index is hidden and this is the only
 * way to move between sections without opening the sheet.
 */
export default function NavStepper() {
  const intl = useIntl()
  const active = useActiveSection()
  const here = active === null ? 0 : NAV.findIndex((n) => n.id === active)
  const i = here < 0 ? 0 : here

  const go = (d: -1 | 1) => {
    const next = NAV[i + d]
    if (next) scrollToSection(next.id)
  }

  return (
    <div className="nav-step" role="group" aria-label={intl.formatMessage(M.navSteps)}>
      <button
        type="button"
        className="nav-step-btn"
        onClick={() => go(-1)}
        disabled={i === 0}
        aria-label={intl.formatMessage(M.navPrev)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.6 10.2 L8 5.8 L12.4 10.2" />
        </svg>
      </button>
      <span className="nav-step-count" aria-hidden>{`0${i + 1} / 0${NAV.length}`}</span>
      <button
        type="button"
        className="nav-step-btn"
        onClick={() => go(1)}
        disabled={i === NAV.length - 1}
        aria-label={intl.formatMessage(M.navNext)}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.6 5.8 L8 10.2 L12.4 5.8" />
        </svg>
      </button>
    </div>
  )
}
