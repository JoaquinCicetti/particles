import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { HOME, NAV, onAnchorClick } from './nav'
import { useActiveSection } from './useActiveSection'

/**
 * Section index pinned left of the progress rail (desktop only). Home is its
 * own smaller chip above the list, since it is the 3D story rather than a
 * section. The active item follows the section in view, published by
 * Solutions — which publishes `null` for the whole story, and that is exactly
 * when home is the one we are looking at.
 */
export default function SideNav() {
  const intl = useIntl()
  const active = useActiveSection()
  const atHome = active === null

  return (
    <nav className="sidenav" aria-label={intl.formatMessage(M.navMenu)}>
      <a
        href={`#${HOME.id}`}
        onClick={onAnchorClick}
        className={`sidenav-home${atHome ? ' is-active' : ''}`}
        aria-current={atHome ? 'location' : undefined}
      >
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="M3.6 10.2 L8 5.8 L12.4 10.2" />
        </svg>
        <span>{intl.formatMessage(HOME.msg)}</span>
      </a>
      <div className="sidenav-panel">
        {NAV.map((n) => {
          const isActive = active === n.id
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
      </div>
    </nav>
  )
}
