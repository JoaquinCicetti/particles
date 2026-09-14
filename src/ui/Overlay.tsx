import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import { createRandom } from '../lib/random'
import { M } from '../i18n/messages'
import SideNav from './SideNav'
import ContactCta from './ContactCta'
import LangPicker from './LangPicker'
import SensorIcon from './SensorIcon'
import { onAnchorClick } from './nav'

// sensor chips. Airflow is gone — the label was the only thing distinguishing
// it and the chips no longer carry labels. Positions are set per chip in CSS.
const METRICS = [
  { icon: 'temp', label: M.mTempLabel, value: '18.4', unit: '°C' },
  { icon: 'hum', label: M.mHumLabel, value: '61.2', unit: '%HR' },
  { icon: 'co2', label: M.mCo2Label, value: '412', unit: 'PPM' },
  { icon: 'ec', label: M.mEcLabel, value: '1.9', unit: 'mS/cm' },
  { icon: 'ph', label: M.mPhLabel, value: '6.3', unit: 'pH' },
  { icon: 'press', label: M.mPressLabel, value: '1.2', unit: 'bar' },
] as const
// hold the chips back until the particle wall is building behind them — the
// dense field is what gives the mono type enough contrast to read. Widened
// from [0.3, 0.56] so the five arrivals have somewhere to spread out.
const METRIC_WINDOW: [number, number] = [0.28, 0.6]
/**
 * Which safe box the stylesheet will map the scatter into. Read once, at
 * module init: the chip layout is drawn once per load too, so re-reading it on
 * resize would only matter to someone dragging a desktop window across 720px
 * mid-story.
 */
const PHONE = typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 720px)').matches

/** sparkline box, in its own user units */
const SPARK: [number, number] = [72, 30]
/**
 * The chips rise as ONE field: a single amplitude, off a single progress
 * through METRIC_WINDOW, so every card translates by exactly the same amount
 * at any moment and their relative positions never change.
 *
 * They used to carry a per-chip rise distance and therefore a per-chip speed,
 * which is what made them cross and overlap in flight. No static layout can
 * survive that — five boxes moving past one another at different rates will
 * collide whatever their starting spacing — so the variation moved to the
 * things that cannot cause a collision: when each chip fades in, how it sways,
 * and the phase of its idle bob.
 */
const RISE = 34 // vh travelled bottom-to-top
const RISE_DROP = 0.52 // how much of that sits below the resting slot
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
 * matter which chip sits on which beat. The slots below are far wider than the
 * first pass: three chips used to land inside 0.02 of scroll, which is a
 * single beat, not a burst.
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
const { METRIC_DELAY, METRIC_BUBBLE, METRIC_SPARK, METRIC_SPOT } = (() => {
  const rnd = createRandom((Date.now() & 0xffff) | 1)
  const shuffle = <T,>(xs: T[]) => {
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      const tmp = xs[i]
      xs[i] = xs[j]
      xs[j] = tmp
    }
    return xs
  }

  const slots = [0, 0.03, 0.088, 0.108, 0.128, 0.176].map((v) => v + rnd() * 0.026)
  const order = shuffle(METRICS.map((_, i) => i))
  const delay = new Array<number>(METRICS.length).fill(0)
  order.forEach((chip, k) => {
    delay[chip] = slots[k] ?? 0
  })

  // Horizontal drift only. Capped at 0.9vw (~13px at 1440) — two chips can
  // close on each other by twice that, which the scatter's MIN_U allows for.
  const bubble = METRICS.map(() => ({
    sway: 0.35 + rnd() * 0.55,
    swaySpeed: 0.22 + rnd() * 0.3,
    phase: rnd() * Math.PI * 2,
  }))

  /**
   * One short trace per chip — a bounded random walk plotted into the SPARK
   * box, as both a line and the area under it. Drawn from the same seeded pass
   * so every load gets its own readings; the point is that the five chips
   * never show the same trace twice, not that any of them means something.
   */
  const N = 13
  const [SW, SH] = SPARK
  const spark = METRICS.map(() => {
    let v = 0.35 + rnd() * 0.3
    const pts: string[] = []
    for (let i = 0; i < N; i++) {
      v = Math.min(0.88, Math.max(0.12, v + (rnd() - 0.44) * 0.32))
      pts.push(`${((i / (N - 1)) * SW).toFixed(1)},${((1 - v) * SH).toFixed(1)}`)
    }
    const line = pts.join(' ')
    return { line, area: `M0 ${SH} L ${line} L ${SW} ${SH} Z` }
  })

  /**
   * Where each chip sits, as a 0..1 pair the stylesheet maps into the safe box
   * for the current breakpoint. Drawn per load, because a hand-placed table
   * always ends up reading as one: the last one stacked three chips down the
   * left edge and left the middle empty.
   *
   * Each draw is a LATIN HYPERCUBE sample — every chip gets its own column of
   * the width and its own row of the height, jittered inside that cell.
   * Plain uniform randomness clumps (two chips in one corner and a bare half
   * is the common draw); stratifying both axes guarantees the chips cover the
   * frame however the dice land.
   *
   * Stratification alone is not enough, though: a card is wider than its own
   * cell, so two chips in neighbouring columns AND neighbouring rows still
   * land on top of each other. So a draw is rejected if any pair is close on
   * BOTH axes — that is exactly the box-overlap test — and also if the five
   * sort into a straight diagonal, which satisfies every cell and still reads
   * as a queue. After the tries run out the last draw stands; it is always a
   * valid sample, just possibly a crowded one.
   */
  const n = METRICS.length
  /**
   * Card size as a fraction of the band it sits in — the minimum separation a
   * pair needs on an axis before their boxes stop touching.
   *
   * The two breakpoints are genuinely different problems. On a desktop the
   * band is ~900 px wide and a card ~230 px, so either axis can do the
   * separating. On a phone the band is ~226 px and the card ~177 px: no two
   * chips can ever be a card apart horizontally, so the vertical axis has to
   * carry it alone — hence the near-1 MIN_U, and the tighter vertical jitter
   * below that keeps consecutive rows from eating into each other.
   */
  const MIN_U = PHONE ? 0.85 : 0.3
  const MIN_V = PHONE ? 0.15 : 0.21
  /**
   * How much of its own cell a point may wander, per axis. The vertical figure
   * is what guarantees phone spacing: there, consecutive rows are a sixth of
   * the band apart (0.167) and the jitter can only eat a tenth of that, which
   * keeps every gap at MIN_V or above by construction rather than by rejection.
   */
  const JIT_U = 0.76
  const JIT_V = PHONE ? 0.1 : 0.76
  /**
   * The caption's corner, in the same 0..1 space: a chip whose left edge is
   * left of `u` AND whose top is below `v` lands on the copy. On a desktop
   * there is room to route around it. On a phone the caption spans the full
   * width, so nothing could satisfy it — there the band itself stops above the
   * copy instead (see the stylesheet), and this stays null.
   */
  const AVOID = PHONE ? null : { u: 0.6, v: 0.5 }
  const onCaption = (pts: Array<{ u: number; v: number }>) =>
    !!AVOID && pts.some((pt) => pt.u < AVOID.u && pt.v > AVOID.v)

  const draw = () => {
    const cols = shuffle(METRICS.map((_, i) => i))
    const rows = shuffle(METRICS.map((_, i) => i))
    return METRICS.map((_, k) => ({
      u: (cols[k] + (1 - JIT_U) / 2 + rnd() * JIT_U) / n,
      v: (rows[k] + (1 - JIT_V) / 2 + rnd() * JIT_V) / n,
    }))
  }

  const crowded = (pts: Array<{ u: number; v: number }>) => {
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (Math.abs(pts[i].u - pts[j].u) < MIN_U && Math.abs(pts[i].v - pts[j].v) < MIN_V) return true
    const byU = [...pts].sort((a, b) => a.u - b.u).map((pt) => pt.v)
    return (
      byU.every((v, i) => i === 0 || v > byU[i - 1]) || byU.every((v, i) => i === 0 || v < byU[i - 1])
    )
  }

  /**
   * Two passes, because the constraints differ in kind. Clearing the caption
   * is a preference — ~96 % of draws manage it — while pair spacing is not
   * negotiable, so a failure to find a draw that does both falls back to one
   * that at least does not overlap, and the caption's scrim covers the rest.
   */
  let spot = draw()
  let tries = 0
  for (; tries < 600 && (crowded(spot) || onCaption(spot)); tries++) spot = draw()
  for (; tries < 800 && crowded(spot); tries++) spot = draw()

  return { METRIC_DELAY: delay, METRIC_BUBBLE: bubble, METRIC_SPARK: spark, METRIC_SPOT: spot }
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

      // one rise for the whole field — see RISE. Computed once per frame, not
      // per card, precisely so no two cards can drift apart vertically.
      const [a0, b] = METRIC_WINDOW
      const fieldT = Math.min(1, Math.max(0, (p - a0) / (b - a0)))
      const fieldY = lerp(RISE * RISE_DROP, -RISE * (1 - RISE_DROP), fieldT)

      cards.forEach((c, i) => {
        const a = a0 + (METRIC_DELAY[i] ?? 0)
        const o = fadeWindow(p, a, b, 0.22)
        const bub = METRIC_BUBBLE[i]
        c.style.opacity = String(o)
        // effervescence: the field rises past the resting slots while each chip
        // sways on its own phase and swells as it arrives
        const x = Math.sin(now * 0.001 * bub.swaySpeed + bub.phase) * bub.sway
        c.style.transform = `translate(${x}vw, ${fieldY}vh) scale(${0.68 + 0.32 * o})`
        c.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      })

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
          <span className="wordmark">Growcast</span>
        </a>
        <div className="nav-right">
          <LangPicker />
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

      <section className="block" data-window="0.16,0.3">
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

      {/* each chip is a little instrument: what it measures, the reading, and
          the trace behind it. Icon + number alone read as a loose tag. */}
      {METRICS.map((m, i) => (
        <div
          key={m.icon}
          className="metric"
          data-metric
          style={{ ['--u' as string]: METRIC_SPOT[i].u, ['--v' as string]: METRIC_SPOT[i].v }}
        >
          <div className="metric-float" style={{ animationDelay: `${-i * 0.7}s` }}>
            <span className="metric-head">
              <SensorIcon name={m.icon} />
              <span className="metric-name">{intl.formatMessage(m.label)}</span>
            </span>
            <span className="metric-read">
              <span className="metric-value">
                {m.value}
                <span className="metric-unit">{m.unit}</span>
              </span>
              <svg className="metric-spark" viewBox={`0 0 ${SPARK[0]} ${SPARK[1]}`} aria-hidden>
                <g className="metric-spark-grid">
                  {[0.25, 0.5, 0.75].map((f) => (
                    <path key={`h${f}`} d={`M0 ${SPARK[1] * f} H${SPARK[0]}`} />
                  ))}
                  {[0.25, 0.5, 0.75].map((f) => (
                    <path key={`v${f}`} d={`M${SPARK[0] * f} 0 V${SPARK[1]}`} />
                  ))}
                </g>
                <path className="metric-spark-area" d={METRIC_SPARK[i].area} />
                <polyline className="metric-spark-line" points={METRIC_SPARK[i].line} />
              </svg>
            </span>
          </div>
        </div>
      ))}

      <section className="block" data-window="0.5,0.6">
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

      <section className="block" data-window="0.64,0.85">
        <span className="kicker">
          <FormattedMessage {...M.convergeKicker} />
        </span>
        <h2>
          <FormattedMessage {...M.convergeTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.convergeBody} />
        </p>
      </section>

      <div className="hint" data-hint>
        <span className="hint-label">
          <FormattedMessage {...M.hint} />
        </span>
        {/* a mouse with a falling wheel, not a bare rule — the old 1px
            gradient line read as a divider rather than as an invitation */}
        <span className="hint-icon" aria-hidden>
          <svg className="hint-mouse" viewBox="0 0 24 38">
            <rect x="1.2" y="1.2" width="21.6" height="35.6" rx="10.8" />
            <circle className="hint-wheel" cx="12" cy="10.5" r="2.3" />
          </svg>
          <svg className="hint-chevron" viewBox="0 0 24 13">
            <path d="M3.4 3 L12 10.2 L20.6 3" />
          </svg>
        </span>
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
