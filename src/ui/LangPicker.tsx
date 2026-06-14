import { useEffect, useRef } from 'react'
import { scrollState } from '../lib/scroll'
import { smoothstep } from '../lib/math'
import { LOCALES, useLocale, type Locale } from '../i18n/I18nProvider'

const LABELS: Record<Locale, string> = { es: 'ES', en: 'EN', pt: 'PT' }

/**
 * Smooth segmented language switcher pinned to the bottom-right. It only shows
 * at the start (hero) and at the finale — fading out of the way while the user
 * is travelling through the scene so it never distracts mid-experience.
 */
export default function LangPicker() {
  const { locale, setLocale } = useLocale()
  const root = useRef<HTMLDivElement>(null)
  const index = LOCALES.indexOf(locale)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    const tick = () => {
      const p = scrollState.smooth
      // visible near the top and again at the finale, hidden in between
      const vis = Math.max(1 - smoothstep(0.02, 0.06, p), smoothstep(0.9, 0.96, p))
      el.style.opacity = String(vis)
      el.style.pointerEvents = vis > 0.5 ? 'auto' : 'none'
      el.style.visibility = vis < 0.01 ? 'hidden' : 'visible'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="lang" role="group" aria-label="Language" ref={root}>
      <div className="lang-track">
        <span
          className="lang-thumb"
          aria-hidden
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            className={`lang-opt${l === locale ? ' is-active' : ''}`}
            aria-pressed={l === locale}
            onClick={() => setLocale(l)}
          >
            {LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  )
}
