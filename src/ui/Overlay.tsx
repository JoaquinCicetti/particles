import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { scrollState, scrollToProgress, scrollToSection, scrollToY } from '../lib/scroll'
import { ACTS, actIndexAt, copySpan, FINALE_IN, METRIC_WINDOW } from '../lib/acts'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import { M } from '../i18n/messages'
import SideNav from './SideNav'
import ContactCta from './ContactCta'
import SensorIcon from './SensorIcon'
import Stepper from './Stepper'
import { onAnchorClick } from './nav'

// sensor chips — all bubble up together over one window (staggered a touch),
// then drift down as the camera climbs; positions are set per chip in CSS
const METRICS = [
  { icon: 'temp', label: M.mTempLabel, value: '18.4', unit: '°C' },
  { icon: 'hum', label: M.mHumLabel, value: '61.2', unit: '%HR' },
  { icon: 'co2', label: M.mCo2Label, value: '412', unit: 'PPM' },
  { icon: 'vpd', label: M.mVpdLabel, value: '0.95', unit: 'kPa' },
  { icon: 'wc', label: M.mWcLabel, value: '62', unit: '%VWC' },
  { icon: 'ec', label: M.mEcLabel, value: '1.9', unit: 'mS/cm' },
  { icon: 'ph', label: M.mPhLabel, value: '6.3', unit: 'pH' },
] as const

type Props = { onContact: () => void; onMenu: () => void; menuOpen: boolean }

export default function Overlay({ onContact, onMenu, menuOpen }: Props) {
  const intl = useIntl()
  const root = useRef<HTMLDivElement>(null)

  // localized phase labels, kept in a ref so the rAF loop reads the current
  // language without re-binding the animation each render
  const phasesRef = useRef<Array<[number, string]>>([])
  useEffect(() => {
    phasesRef.current = ACTS.map((a) => [a.at, intl.formatMessage(a.label)])
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
    const stepper = el.querySelector<HTMLElement>('[data-stepper]')
    const stepLabel = el.querySelector<HTMLElement>('[data-step-label]')
    const total = String(ACTS.length).padStart(2, '0')

    let raf = 0
    let lastPhase = ''
    let lastStep = ''
    let last = 0
    // locally smoothed "past the story" and whole-page fractions (the story's
    // own `smooth` is advanced by CameraRig; these only matter to the DOM)
    let over = 0
    let page = 0

    // ── navigation ───────────────────────────────────────────────
    // Stepping reuses scrollToY/scrollToProgress, which already handle easing,
    // mid-tween abort and prefers-reduced-motion. `target` (where the user
    // actually is) drives the decision; `smooth` (what is on screen) drives the
    // label. Nothing here touches React.
    const stepTo = (i: number) => scrollToProgress(ACTS[i].at)

    const next = () => {
      const p = scrollState.target
      if (p > 0.995) return scrollToSection('cultivo') // past the story
      const i = actIndexAt(p)
      if (i < ACTS.length - 1) stepTo(i + 1)
      else scrollToProgress(1)
    }
    const prev = () => {
      const i = actIndexAt(scrollState.target)
      stepTo(Math.max(0, i - 1))
    }

    const onPrev = () => prev()
    const onNext = (e: Event) => {
      e.preventDefault()
      next()
    }
    el.querySelector('[data-step-prev]')?.addEventListener('click', onPrev)
    el.querySelector('[data-step-next]')?.addEventListener('click', onNext)
    hint?.addEventListener('click', onNext)
    // the finale's "see solutions" is the same past-the-end branch, not a
    // second mechanism
    el.querySelector('[data-finale-more]')?.addEventListener('click', onNext)

    const EDITABLE = 'input, textarea, select, [contenteditable]'
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      if ((e.target as HTMLElement | null)?.closest?.(EDITABLE)) return
      if (document.querySelector('[role="dialog"]')) return // contact / menu is open
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          next()
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          scrollToY(0)
          break
        case 'End':
          e.preventDefault()
          scrollToProgress(1)
          break
        default:
          return
      }
    }
    window.addEventListener('keydown', onKey)

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
      if (hint) {
        const o = 1 - smoothstep(0.01, 0.05, p)
        hint.style.opacity = String(o)
        // it is a real button now — do not leave an invisible tap target
        hint.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      }

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
        const a = a0 + i * 0.012 // bubble up one after another, quickly
        const o = fadeWindow(p, a, b, 0.22)
        const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
        // la cámara sube por el flujo → los chips derivan hacia abajo
        c.style.opacity = String(o)
        c.style.transform = `translateY(${lerp(-8, 10, t)}vh) scale(${0.7 + 0.3 * o})`
        c.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      })

      if (finale) {
        const o = smoothstep(FINALE_IN, FINALE_IN + 0.06, p) * stay
        finale.style.opacity = String(o)
        finale.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        finale.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      }

      // the rail is a map of the whole page (story + solutions)
      if (railFill) railFill.style.transform = `scaleY(${page})`
      if (railDot) railDot.style.transform = `translateY(${page * 38}vh)`

      // `smooth` only ever approaches its target asymptotically, so a landing
      // on an act boundary sits a hair short of it. Nudge the index lookup by
      // ~2vh so stepping to an act actually reads as that act.
      const pIdx = Math.min(1, p + 0.004)

      if (phaseEl) {
        const phases = phasesRef.current
        let label = phases[0]?.[1] ?? ''
        for (const [at, text] of phases) if (pIdx >= at) label = text
        if (label !== lastPhase) {
          lastPhase = label
          phaseEl.textContent = label
        }
        // the side index takes over as narrator once the solutions are up
        phaseEl.style.opacity = String(stay)
      }

      if (stepper) {
        // change-guarded exactly like the phase ticker: the DOM is touched only
        // when the act index actually changes
        const label = `${String(actIndexAt(pIdx) + 1).padStart(2, '0')} / ${total}`
        if (label !== lastStep) {
          lastStep = label
          if (stepLabel) stepLabel.textContent = label
        }
        stepper.style.opacity = String(stay)
        stepper.style.pointerEvents = stay > 0.5 ? 'auto' : 'none'
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      el.querySelector('[data-step-prev]')?.removeEventListener('click', onPrev)
      el.querySelector('[data-step-next]')?.removeEventListener('click', onNext)
      hint?.removeEventListener('click', onNext)
      el.querySelector('[data-finale-more]')?.removeEventListener('click', onNext)
    }
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

      {ACTS.map((act, i) => {
        if (!act.copy) return null
        const [a, b] = copySpan(i)
        return (
          <section
            key={act.id}
            className={`block block-${act.copy.align}`}
            data-window={`${a},${b}`}
          >
            <span className="kicker">
              <FormattedMessage {...act.copy.kicker} />
            </span>
            <h2>
              <FormattedMessage {...act.copy.title} />
            </h2>
            <p>
              <FormattedMessage {...act.copy.body} />
            </p>
          </section>
        )
      })}

      <footer className="finale" data-finale>
        <span className="finale-word">GROWCAST</span>
        <span className="finale-tag">
          <FormattedMessage {...M.tagline} />
        </span>
        <ContactCta onClick={onContact} />
        <a className="finale-more" href="#cultivo" data-finale-more>
          <FormattedMessage {...M.finaleMore} />
          <i aria-hidden />
        </a>
      </footer>

      <button type="button" className="hint" data-hint>
        <span>
          <FormattedMessage {...M.hint} />
        </span>
        <span className="hint-mouse" aria-hidden>
          <svg viewBox="0 0 16 24">
            <rect x="1" y="1" width="14" height="22" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <i />
        </span>
      </button>

      <SideNav />
      <Stepper />

      <div className="rail" aria-hidden>
        <div className="rail-track">
          <div className="rail-fill" data-rail-fill />
          <div className="rail-dot" data-rail-dot />
        </div>
      </div>

      <div className="phase" data-phase aria-hidden>
        {intl.formatMessage(ACTS[0].label)}
      </div>

      <div className="grain" aria-hidden />
    </div>
  )
}
