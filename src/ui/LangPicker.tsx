import type { ReactNode } from 'react'
import { LOCALES, useLocale, type Locale } from '../i18n/I18nProvider'

/** Each language in its own name — the flag's accessible label. */
const NAMES: Record<Locale, string> = { es: 'Español', en: 'English', pt: 'Português' }

/**
 * Round flags, drawn inline rather than as emoji (Windows renders flag emoji
 * as two bare letters). Spanish flies Argentina's — Growcast is in Rosario —
 * and Portuguese, Brazil's. Authored on a 24×24 square; the round crop is CSS.
 */
const FLAGS: Record<Locale, ReactNode> = {
  es: (
    <>
      <rect width="24" height="24" fill="#74acdf" />
      <rect y="8" width="24" height="8" fill="#fff" />
      <circle cx="12" cy="12" r="2.6" fill="#f6b40e" />
    </>
  ),
  en: (
    <>
      <rect width="24" height="24" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 24) / 13} width="24" height={24 / 13} fill="#b22234" />
      ))}
      <rect width="11" height={(7 * 24) / 13} fill="#3c3b6e" />
    </>
  ),
  pt: (
    <>
      <rect width="24" height="24" fill="#009c3b" />
      <path d="M12 3.6 22.6 12 12 20.4 1.4 12z" fill="#ffdf00" />
      <circle cx="12" cy="12" r="4.6" fill="#002776" />
    </>
  ),
}

/**
 * Language switcher: one flag per locale. Lives in the landing header on a
 * desktop, in the menu sheet on a phone, and in the designer's top bar.
 */
export default function LangPicker() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="lang" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className={`lang-opt${l === locale ? ' is-active' : ''}`}
          aria-pressed={l === locale}
          aria-label={NAMES[l]}
          title={NAMES[l]}
          onClick={() => setLocale(l)}
        >
          <span className="lang-flag" aria-hidden>
            <svg viewBox="0 0 24 24">{FLAGS[l]}</svg>
          </span>
        </button>
      ))}
    </div>
  )
}
