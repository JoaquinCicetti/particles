import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import { createRandom } from '../lib/random'
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
const METRIC_WINDOW: [number, number] = [0.3, 0.56]
/**
 * Per-chip entry delays and per-chip bubble motion, both drawn fresh PER PAGE
 * LOAD from one seeded pass.
 *
 * On the entry order: any fixed table is a sequence however you permute it —
 * the same chips arrive in the same order every time, and after two viewings
 * you are watching a cue list. Two earlier attempts failed for a subtler reason
 * as well: .metric-1..6 are laid out alternating left/right and descending, so
 * a table scrambled by array INDEX can still sort into a tidy spatial sweep,
 * which is exactly what happened both times. So the order is shuffled on every
 * load, and the gaps are CLUSTERED rather than even — a pair, a pause, a burst
 * of three, a pause, a straggler — because even gaps read as a drumbeat no
 * matter which chip sits on which beat.
 *
 * On the motion: the chips are effervescence. Each is a bubble in the same flow
 * the particles are in, so it RISES through its window (it used to drift down
 * as a parallax against the climbing camera, which read as sinking), carries
 * its own rise distance and rate, sways gently sideways on its own phase, and
 * swells a little as it goes.
 *
 * Seeded off the clock rather than Math.random() to stay with the codebase's
 * seeded-PRNG convention (react-hooks/purity forbids Math.random in render;
 * this runs once at module init, but the convention is worth keeping).
 */
const { METRIC_DELAY, METRIC_BUBBLE } = (() => {
  const rnd = createRandom((Date.now() & 0xffff) | 1)

  const slots = [0, 0.012, 0.052, 0.061, 0.072, 0.132].map((v) => v + rnd() * 0.014)
  const order = METRICS.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const tmp = order[i]
    order[i] = order[j]
    order[j] = tmp
  }
  const delay = new Array<number>(METRICS.length).fill(0)
  order.forEach((chip, k) => {
    delay[chip] = slots[k] ?? 0
  })

  const bubble = METRICS.map(() => ({
    rise: 30 + rnd() * 18, // vh travelled bottom-to-top
    drop: 0.42 + rnd() * 0.2, // how much of that sits below the resting slot
    // capped at 0.9vw (~13px at 1440): the right-hand chips clear the side
    // index panel by ~19px, and a wider sway walks them under it
    sway: 0.35 + rnd() * 0.55,
    swaySpeed: 0.22 + rnd() * 0.3,
    phase: rnd() * Math.PI * 2,
  }))

  return { METRIC_DELAY: delay, METRIC_BUBBLE: bubble }
})()

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
        const bub = METRIC_BUBBLE[i]
        c.style.opacity = String(o)
        // effervescence: rise from below the resting slot up past it, swaying on
        // this bubble's own phase and swelling a little on the way
        const y = lerp(bub.rise * bub.drop, -bub.rise * (1 - bub.drop), t)
        const x = Math.sin(now * 0.001 * bub.swaySpeed + bub.phase) * bub.sway
        c.style.transform = `translate(${x}vw, ${y}vh) scale(${0.68 + 0.32 * o})`
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
