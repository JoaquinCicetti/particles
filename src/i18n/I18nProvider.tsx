import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { M } from './messages'
import en from './locales/en.json'
import pt from './locales/pt.json'

export const LOCALES = ['es', 'en', 'pt'] as const
export type Locale = (typeof LOCALES)[number]

const STORAGE_KEY = 'gc_lang'

// es is the source: derive its catalog from the defaultMessages
const es: Record<string, string> = Object.fromEntries(
  Object.values(M).map((m) => [m.id, m.defaultMessage as string]),
)

const CATALOGS: Record<Locale, Record<string, string>> = { es, en, pt }

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'es'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale
  const nav = (navigator.languages?.[0] || navigator.language || 'es').toLowerCase()
  if (nav.startsWith('pt')) return 'pt'
  if (nav.startsWith('es')) return 'es'
  return 'en'
}

type Ctx = { locale: Locale; setLocale: (l: Locale) => void }
const LocaleContext = createContext<Ctx>({ locale: 'es', setLocale: () => {} })

export const useLocale = () => useContext(LocaleContext)

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  // keep <html lang> in sync (initial detect + every change)
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* private mode — ignore */
    }
  }

  const ctx = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LocaleContext.Provider value={ctx}>
      <IntlProvider locale={locale} defaultLocale="es" messages={CATALOGS[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}
