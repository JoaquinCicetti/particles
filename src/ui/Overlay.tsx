import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import { M } from '../i18n/messages'
import SideNav from './SideNav'
import ContactCta from './ContactCta'
import SensorIcon from './SensorIcon'
import { onAnchorClick } from './nav'

// sensor chips — all bubble up together over one window (staggered a touch),
// then drift down as the camera climbs; positions are set per chip in CSS
const METRICS = [
  { icon: 'temp', label: M.mTempLabel, value: '18.4', unit: '°C' },
  { icon: 'hum', label: M.mHumLabel, value: '61.2', unit: '%HR' },
  { icon: 'co2', label: M.mCo2Label, value: '412', unit: 'PPM' },
  { icon: 'ec', label: M.mEcLabel, value: '1.9', unit: 'mS/cm' },
  { icon: 'ph', label: M.mPhLabel, value: '6.3', unit: 'pH' },
  { icon: 'air', label: M.mAirLabel, value: '1.8', unit: 'm/s' },
] as const
// hold the chips back until the particle wall is building behind them — the
// dense field is what gives the small mono type enough contrast to read
const METRIC_WINDOW: [number, number] = [0.27, 0.5]
// scrambled per-chip delays so they arrive in no discernible order rather than
// marching in together (a uniform i * step read as one block)
const METRIC_DELAY = [0.062, 0.0, 0.094, 0.03, 0.112, 0.047] as const

const PHASE_AT = [0, 0.16, 0.32, 0.5, 0.62, 0.88] as const
const PHASE_MSG = [M.phase1, M.phase2, M.phase3, M.phase4, M.phase5, M.phase6] as const

type Props = { onContact: () => void; onMenu: () => void; menuOpen: boolean }

export default function Overlay({ onContact, onMenu, menuOpen }: Props) {
  const intl = useIntl()
  const root = useRef<HTMLDivElement>(null)

  // localized phase labels, kept in a ref so the rAF loop reads the current
  // language without re-binding the animation each render
  const phasesRef = useRef<Array<[number, string]>>([])
  useEffect(() => {
    phasesRef.current = PHASE_AT.map((at, i) => [at, intl.formatMessage(PHASE_MSG[i])])
  }, [intl])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const q = <T extends HTMLElement>(sel: string) => Array.from(el.querySelectorAll<T>(sel))

    const hero = el.querySelector<HTMLElement>('[data-hero]')
    const hint = el.querySelector<HTMLElement>('[data-hint]')
    const sections = q<HTMLElement>('[data-window]')
    const cards = q<HTMLElement>('[data-metric]')
    const finale = el.querySelector<HTMLElement>('[data-finale]')
    const railFill = el.querySelector<HTMLElement>('[data-rail-fill]')
    const railDot = el.querySelector<HTMLElement>('[data-rail-dot]')
    const phaseEl = el.querySelector<HTMLElement>('[data-phase]')

    let raf = 0
    let lastPhase = ''
    let last = 0
    // locally smoothed "past the story" and whole-page fractions (the story's
    // own `smooth` is advanced by CameraRig; these only matter to the DOM)
    let over = 0
    let page = 0

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      const k = 1 - Math.exp(-dt * 4)
      over += (scrollState.over - over) * k
      page += (scrollState.page - page) * k
      const p = scrollState.smooth
      // story chrome fades as the solutions slide over the finale
      const stay = 1 - smoothstep(0.05, 0.4, over)

      if (hero) {
        const o = 1 - smoothstep(0.05, 0.13, p)
        hero.style.opacity = String(o)
        hero.style.transform = `translateY(${-smoothstep(0.05, 0.13, p) * 48}px)`
        hero.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      }
      if (hint) hint.style.opacity = String(1 - smoothstep(0.01, 0.05, p))

      for (const s of sections) {
        const [a, b] = (s.dataset.window ?? '0,1').split(',').map(Number)
        const o = fadeWindow(p, a, b, 0.22)
        const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
        s.style.opacity = String(o)
        s.style.transform = `translateY(${lerp(28, -28, t)}px)`
        s.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      }

      cards.forEach((c, i) => {
        const [a0, b] = METRIC_WINDOW
        const a = a0 + (METRIC_DELAY[i] ?? 0)
        const o = fadeWindow(p, a, b, 0.22)
        const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
        // la cámara sube por el flujo → los chips derivan hacia abajo
        c.style.opacity = String(o)
        c.style.transform = `translateY(${lerp(-8, 10, t)}vh) scale(${0.7 + 0.3 * o})`
        c.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      })

      if (finale) {
        const o = smoothstep(0.92, 0.98, p) * stay
        finale.style.opacity = String(o)
        finale.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        finale.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      }

      // the rail is a map of the whole page (story + solutions)
      if (railFill) railFill.style.transform = `scaleY(${page})`
      if (railDot) railDot.style.transform = `translateY(${page * 38}vh)`

      if (phaseEl) {
        const phases = phasesRef.current
        let label = phases[0]?.[1] ?? ''
        for (const [at, text] of phases) if (p >= at) label = text
        if (label !== lastPhase) {
          lastPhase = label
          phaseEl.textContent = label
        }
        // the side index takes over as narrator once the solutions are up
        phaseEl.style.opacity = String(stay)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="overlay" ref={root}>
      <nav className="nav">
        <a className="brand" href="#top" onClick={onAnchorClick} aria-label={intl.formatMessage(M.brandAria)}>
          <span className="brand-mark" aria-hidden />
          <span className="wordmark">GROWCAST</span>
        </a>
        <div className="nav-right">
          <ContactCta variant="nav" onClick={onContact} />
          <button
            type="button"
            className="nav-menu"
            onClick={onMenu}
            aria-label={intl.formatMessage(M.navMenu)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <span className="nav-menu-lines" aria-hidden>
              <i />
              <i />
            </span>
            <span>
              <FormattedMessage {...M.navMenu} />
            </span>
          </button>
        </div>
      </nav>

      <header className="hero" data-hero>
        <span className="kicker">
          <FormattedMessage {...M.heroKicker} />
        </span>
        <h1>
          <FormattedMessage
            {...M.heroTitle}
            values={{ br: () => <br />, accent: (c) => <span className="accent">{c}</span> }}
          />
        </h1>
        <p>
          <FormattedMessage {...M.heroBody} />
        </p>
      </header>

      <section className="block block-center" data-window="0.16,0.3">
        <span className="kicker">
          <FormattedMessage {...M.sensorsKicker} />
        </span>
        <h2>
          <FormattedMessage {...M.sensorsTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.sensorsBody} />
        </p>
      </section>

      {METRICS.map((m, i) => (
        <div key={m.icon} className={`metric metric-${i + 1}`} data-metric>
          <div className="metric-float" style={{ animationDelay: `${-i * 0.7}s` }}>
            <SensorIcon name={m.icon} />
            <span className="metric-value">
              {m.value}
              <span className="metric-unit">{m.unit}</span>
            </span>
            <span className="metric-label">{intl.formatMessage(m.label)}</span>
          </div>
        </div>
      ))}

      <section className="block block-left" data-window="0.5,0.6">
        <span className="kicker">
          <FormattedMessage {...M.dataKicker} />
        </span>
        <h2>
          <FormattedMessage {...M.dataTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.dataBody} />
        </p>
      </section>

      <section className="block block-left" data-window="0.64,0.85">
        <span className="kicker">
          <FormattedMessage {...M.tagline} />
        </span>
        <h2>
          <FormattedMessage {...M.convergeTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.convergeBody} />
        </p>
      </section>

      <footer className="finale" data-finale>
        <span className="finale-word">GROWCAST</span>
        <span className="finale-tag">
          <FormattedMessage {...M.tagline} />
        </span>
        <ContactCta onClick={onContact} />
        <a className="finale-more" href="#cultivo" onClick={onAnchorClick}>
          <FormattedMessage {...M.finaleMore} />
          <i aria-hidden />
        </a>
      </footer>

      <div className="hint" data-hint>
        <span>
          <FormattedMessage {...M.hint} />
        </span>
        <i />
      </div>

      <SideNav />

      <div className="rail" aria-hidden>
        <div className="rail-track">
          <div className="rail-fill" data-rail-fill />
          <div className="rail-dot" data-rail-dot />
        </div>
      </div>

      <div className="phase" data-phase aria-hidden>
        {intl.formatMessage(M.phase1)}
      </div>

      <div className="grain" aria-hidden />
    </div>
  )
}
