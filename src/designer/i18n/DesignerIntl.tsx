import { useMemo, type ReactNode } from 'react'
import { IntlProvider, useIntl } from 'react-intl'
import { useLocale, type Locale } from '../../i18n/I18nProvider'
import { D } from './messages'
import en from './en.json'
import pt from './pt.json'

const es: Record<string, string> = Object.fromEntries(
  Object.values(D).map((m) => [m.id, m.defaultMessage as string]),
)
const CATALOGS: Record<Locale, Record<string, string>> = { es, en, pt }

/** Layers the designer catalog over the landing one (same locale switch). */
export default function DesignerIntl({ children }: { children: ReactNode }) {
  const { locale } = useLocale()
  const parent = useIntl()
  // the landing catalog is plain strings too (see I18nProvider)
  const messages = useMemo(
    () => ({ ...(parent.messages as Record<string, string>), ...CATALOGS[locale] }),
    [parent.messages, locale],
  )
  return (
    <IntlProvider locale={locale} defaultLocale="es" messages={messages}>
      {children}
    </IntlProvider>
  )
}
