import { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import { M } from '../i18n/messages'
import ContactDialog from './ContactDialog'

const METRICS = [
  { label: M.mTempLabel, value: '18.4', unit: '°C', note: M.mTempNote, bar: 0.42, range: [0.16, 0.24], side: 'left' },
  { label: M.mHumLabel, value: '61.2', unit: '%HR', note: M.mHumNote, bar: 0.61, range: [0.2, 0.28], side: 'right' },
  { label: M.mCo2Label, value: '412', unit: 'PPM', note: M.mCo2Note, bar: 0.28, range: [0.24, 0.32], side: 'left' },
  { label: M.mEcLabel, value: '1.9', unit: 'mS/cm', note: M.mEcNote, bar: 0.55, range: [0.28, 0.36], side: 'right' },
  { label: M.mPhLabel, value: '6.3', unit: '', note: M.mPhNote, bar: 0.63, range: [0.32, 0.4], side: 'left' },
  { label: M.mAirLabel, value: '1.8', unit: 'M/S', note: M.mAirNote, bar: 0.74, range: [0.36, 0.44], side: 'right' },
] as const

const PHASE_AT = [0, 0.16, 0.32, 0.5, 0.62, 0.88] as const
const PHASE_MSG = [M.phase1, M.phase2, M.phase3, M.phase4, M.phase5, M.phase6] as const

export default function Overlay() {
  const intl = useIntl()
  const root = useRef<HTMLDivElement>(null)
  const [contactOpen, setContactOpen] = useState(false)

  // localized phase labels, kept in a ref so the rAF loop reads the current
  // language without re-binding the animation each render
  const phasesRef = useRef<Array<[number, string]>>([])
  phasesRef.current = PHASE_AT.map((at, i) => [at, intl.formatMessage(PHASE_MSG[i])])

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

    const tick = () => {
      const p = scrollState.smooth

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
        const [a, b] = METRICS[i].range
        const o = fadeWindow(p, a, b, 0.3)
        const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
        // la cámara sube por el flujo → las tarjetas pasan hacia abajo
        c.style.opacity = String(o)
        c.style.transform = `translateY(${lerp(-30, 30, t)}vh)`
        c.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      })

      if (finale) {
        const o = smoothstep(0.92, 0.98, p)
        finale.style.opacity = String(o)
        finale.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        finale.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      }

      if (railFill) railFill.style.transform = `scaleY(${p})`
      if (railDot) railDot.style.transform = `translateY(${p * 38}vh)`

      if (phaseEl) {
        const phases = phasesRef.current
        let label = phases[0]?.[1] ?? ''
        for (const [at, text] of phases) if (p >= at) label = text
        if (label !== lastPhase) {
          lastPhase = label
          phaseEl.textContent = label
        }
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="overlay" ref={root}>
      <nav className="nav">
        <a className="brand" href="#top" aria-label={intl.formatMessage(M.brandAria)}>
          <span className="brand-mark" aria-hidden />
          <span className="wordmark">GROWCAST</span>
          <span className="brand-sub">AGRO</span>
        </a>
        <div className="nav-right">
          <button type="button" className="nav-cta" onClick={() => setContactOpen(true)}>
            <FormattedMessage {...M.navCta} />
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

      {METRICS.map((m) => (
        <div key={m.label.id} className={`metric metric-${m.side}`} data-metric>
          <span className="metric-label">{intl.formatMessage(m.label)}</span>
          <div className="metric-value">
            {m.value}
            <span className="metric-unit">{m.unit}</span>
          </div>
          <div className="metric-bar">
            <i style={{ width: `${m.bar * 100}%` }} />
          </div>
          <span className="metric-note">{intl.formatMessage(m.note)}</span>
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
        <span className="finale-word">
          GROWCAST<span className="finale-sub">AGRO</span>
        </span>
        <span className="finale-tag">
          <FormattedMessage {...M.tagline} />
        </span>
        <button type="button" className="cta" onClick={() => setContactOpen(true)}>
          <span className="cta-label">
            <FormattedMessage {...M.finaleCta} />
          </span>
          <span className="cta-arrow" aria-hidden>→</span>
        </button>
        <span className="finale-fine">
          <FormattedMessage {...M.finaleFine} />
        </span>
      </footer>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />

      <div className="hint" data-hint>
        <span>
          <FormattedMessage {...M.hint} />
        </span>
        <i />
      </div>

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
