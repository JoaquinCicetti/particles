import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { APP_URL } from '../lib/contact'
import { LEGAL_PATHS, onNavClick } from '../lib/route'

/** The way into the platform plus the three legal pages — footer, menu and the legal pages' own foot. */
export default function LegalLinks({ className = '' }: { className?: string }) {
  const t = useIntl().formatMessage
  return (
    <nav className={`legal-links ${className}`.trim()} aria-label={t(M.legalNavAria)}>
      <a href={APP_URL}>{t(M.navApp)}</a>
      <a href={LEGAL_PATHS.terms} onClick={onNavClick}>
        {t(M.legalTerms)}
      </a>
      <a href={LEGAL_PATHS.privacy} onClick={onNavClick}>
        {t(M.legalPrivacy)}
      </a>
      <a href={LEGAL_PATHS.regret} onClick={onNavClick}>
        {t(M.legalRegret)}
      </a>
    </nav>
  )
}
