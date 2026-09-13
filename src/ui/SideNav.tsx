import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { NAV, onAnchorClick } from './nav'
import NavStepper from './NavStepper'
import { useActiveSection } from './useActiveSection'

/**
 * Vertical section index pinned left of the progress rail (desktop only),
 * with a prev/next stepper in its footer. Active item follows the section
 * currently in view, published by Solutions — which publishes `null` for the
 * whole 3D story, and that is exactly when the first entry ('top' / INICIO) is
 * the one we are looking at. The stepper reads the same source, so the list
 * and its footer can never disagree.
 */
export default function SideNav() {
  const intl = useIntl()
  const active = useActiveSection()

  return (
    <nav className="sidenav" aria-label={intl.formatMessage(M.navMenu)}>
      {NAV.map((n) => {
        const isActive = n.id === 'top' ? active === null : active === n.id
        return (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={onAnchorClick}
            className={`sidenav-item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'location' : undefined}
          >
            <span>{intl.formatMessage(n.msg)}</span>
            <i aria-hidden />
          </a>
        )
      })}
      <NavStepper />
    </nav>
  )
}
