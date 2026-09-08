import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { SECTION_EVENT, scrollState } from '../lib/scroll'
import { M } from '../i18n/messages'
import { NAV, onAnchorClick } from './nav'

/**
 * Vertical section index pinned left of the progress rail (desktop only).
 * Active item follows the section currently in view, published by Solutions.
 */
export default function SideNav() {
  const intl = useIntl()
  const [active, setActive] = useState<string | null>(scrollState.section)

  useEffect(() => {
    const onSection = (e: Event) => setActive((e as CustomEvent<string | null>).detail)
    window.addEventListener(SECTION_EVENT, onSection)
    return () => window.removeEventListener(SECTION_EVENT, onSection)
  }, [])

  return (
    <nav className="sidenav" aria-label={intl.formatMessage(M.navMenu)}>
      {NAV.map((n) => (
        <a
          key={n.id}
          href={`#${n.id}`}
          onClick={onAnchorClick}
          className={`sidenav-item${active === n.id ? ' is-active' : ''}`}
          aria-current={active === n.id ? 'location' : undefined}
        >
          <span>{intl.formatMessage(n.msg)}</span>
          <i aria-hidden />
        </a>
      ))}
    </nav>
  )
}
