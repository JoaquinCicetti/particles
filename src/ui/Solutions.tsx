import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import type { MessageDescriptor } from 'react-intl'
import { M } from '../i18n/messages'
import { setSection } from '../lib/scroll'
import SiloFigure from './SiloFigure'

/**
 * In-flow content that follows the 3D story: one section per solution plus a
 * closing contact block. Everything here is a PROTOTYPE with content slots —
 * `figure` (connection schema) and the per-bullet `icon` keys are meant to be
 * replaced by the client's diagrams and sensor icons.
 */

type Bullet = { icon: string; msg: MessageDescriptor }
type Stat = { label: MessageDescriptor; value: string; unit: string }

type Solution = {
  id: string
  n: string
  kicker: MessageDescriptor
  title: MessageDescriptor
  lede: MessageDescriptor
  who: MessageDescriptor
  measures: MessageDescriptor[]
  steps: [MessageDescriptor, MessageDescriptor, MessageDescriptor]
  implement: Bullet[]
  solve: Bullet[]
  stats: Stat[]
  figure: MessageDescriptor
}

const STEP_TITLES = [M.step1Title, M.step2Title, M.step3Title] as const

// DRAFT data — values are illustrative
const SOLUTIONS: Solution[] = [
  {
    id: 'cultivo',
    n: '01',
    kicker: M.cultivoKicker,
    title: M.cultivoTitle,
    lede: M.cultivoLede,
    who: M.cultivoWho,
    measures: [M.varTemp, M.varHum, M.varCo2, M.varEc, M.varPh, M.varLight, M.varAir],
    steps: [M.cultivoStep1, M.cultivoStep2, M.cultivoStep3],
    implement: [
      { icon: 'node', msg: M.cultivoImpl1 },
      { icon: 'probe', msg: M.cultivoImpl2 },
      { icon: 'valve', msg: M.cultivoImpl3 },
      { icon: 'alert', msg: M.cultivoImpl4 },
    ],
    solve: [
      { icon: 'check', msg: M.cultivoSolve1 },
      { icon: 'check', msg: M.cultivoSolve2 },
      { icon: 'check', msg: M.cultivoSolve3 },
      { icon: 'check', msg: M.cultivoSolve4 },
    ],
    stats: [
      { label: M.cultivoStat1, value: '24.1', unit: '°C' },
      { label: M.cultivoStat2, value: '68', unit: '%HR' },
      { label: M.cultivoStat3, value: '1.9', unit: 'mS/cm' },
    ],
    figure: M.cultivoFigure,
  },
  {
    id: 'silos',
    n: '02',
    kicker: M.silosKicker,
    title: M.silosTitle,
    lede: M.silosLede,
    who: M.silosWho,
    measures: [M.varTemp, M.varGrain, M.varCo2, M.varHum, M.varLevel, M.varPower],
    steps: [M.silosStep1, M.silosStep2, M.silosStep3],
    implement: [
      { icon: 'probe', msg: M.silosImpl1 },
      { icon: 'co2', msg: M.silosImpl2 },
      { icon: 'fan', msg: M.silosImpl3 },
      { icon: 'phone', msg: M.silosImpl4 },
    ],
    solve: [
      { icon: 'check', msg: M.silosSolve1 },
      { icon: 'check', msg: M.silosSolve2 },
      { icon: 'check', msg: M.silosSolve3 },
      { icon: 'check', msg: M.silosSolve4 },
    ],
    stats: [
      { label: M.silosStat1, value: '18.4', unit: '°C' },
      { label: M.silosStat2, value: '412', unit: 'PPM' },
      { label: M.silosStat3, value: '13.5', unit: '%' },
    ],
    figure: M.silosFigure,
  },
  {
    id: 'maduracion',
    n: '03',
    kicker: M.maduracionKicker,
    title: M.maduracionTitle,
    lede: M.maduracionLede,
    who: M.maduracionWho,
    measures: [M.varTemp, M.varHum, M.varCo2, M.varAir, M.varWeight, M.varDoor],
    steps: [M.maduracionStep1, M.maduracionStep2, M.maduracionStep3],
    implement: [
      { icon: 'node', msg: M.maduracionImpl1 },
      { icon: 'snow', msg: M.maduracionImpl2 },
      { icon: 'curve', msg: M.maduracionImpl3 },
      { icon: 'log', msg: M.maduracionImpl4 },
    ],
    solve: [
      { icon: 'check', msg: M.maduracionSolve1 },
      { icon: 'check', msg: M.maduracionSolve2 },
      { icon: 'check', msg: M.maduracionSolve3 },
      { icon: 'check', msg: M.maduracionSolve4 },
    ],
    stats: [
      { label: M.maduracionStat1, value: '12.0', unit: '°C' },
      { label: M.maduracionStat2, value: '85', unit: '%HR' },
      { label: M.maduracionStat3, value: '21', unit: 'D' },
    ],
    figure: M.maduracionFigure,
  },
]

/** Placeholder connection schema: sensors → node → core → actuators. */
function FigurePlaceholder() {
  return (
    <svg className="sol-schema" viewBox="0 0 320 150" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {[28, 60, 92, 124].map((y) => (
          <path key={y} d={`M24 ${y} H88 Q104 ${y} 104 ${y > 76 ? y - 8 : y + 8} V68 Q104 76 116 76 H150`} />
        ))}
        <path d="M188 76 H222 Q236 76 236 64 V44 Q236 36 248 36 H296" />
        <path d="M188 76 H222 Q236 76 236 88 V108 Q236 116 248 116 H296" />
      </g>
      <g fill="currentColor">
        {[28, 60, 92, 124].map((y) => (
          <circle key={y} cx="20" cy={y} r="3.5" />
        ))}
        <circle cx="296" cy="36" r="3.5" />
        <circle cx="296" cy="116" r="3.5" />
      </g>
      <rect x="150" y="60" width="38" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="160" y="70" width="18" height="12" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export default function Solutions({ onContact }: { onContact: () => void }) {
  const intl = useIntl()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const sections = Array.from(el.querySelectorAll<HTMLElement>('section[id]'))

    // reveal once, on first intersection
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            reveal.unobserve(e.target)
          }
        }
      },
      { threshold: 0.18 },
    )
    // active section = the one crossing the middle band of the viewport
    const inView = new Set<string>()
    const active = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id
          if (e.isIntersecting) inView.add(id)
          else inView.delete(id)
        }
        const current = sections.find((s) => inView.has(s.id))
        setSection(current ? current.id : null)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    for (const s of sections) {
      reveal.observe(s)
      active.observe(s)
    }
    return () => {
      reveal.disconnect()
      active.disconnect()
      setSection(null)
    }
  }, [])

  return (
    <div className="solutions" ref={root}>
      <header className="sol-intro">
        <span className="kicker">
          <FormattedMessage {...M.solutionsKicker} />
        </span>
        <h2>
          <FormattedMessage {...M.solutionsTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.solutionsBody} />
        </p>
      </header>

      {SOLUTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className={`sol${i % 2 ? ' sol-flip' : ''}`}>
          <span className="sol-num" aria-hidden>
            {s.n}
          </span>

          <div className="sol-head">
            <span className="kicker">{intl.formatMessage(s.kicker)}</span>
            <h2>{intl.formatMessage(s.title)}</h2>
            <p className="sol-lede">{intl.formatMessage(s.lede)}</p>
            <p className="sol-who">
              <span className="metric-label">{intl.formatMessage(M.solWhoTitle)}</span>
              {intl.formatMessage(s.who)}
            </p>
          </div>

          <div className="sol-measure">
            <span className="metric-label">{intl.formatMessage(M.solMeasureTitle)}</span>
            <ul className="sol-chips">
              {s.measures.map((v) => (
                <li key={v.id}>{intl.formatMessage(v)}</li>
              ))}
            </ul>
            <div className="sol-stats">
              {s.stats.map((st) => (
                <div key={st.label.id} className="sol-stat">
                  <span className="metric-label">{intl.formatMessage(st.label)}</span>
                  <span className="metric-value">
                    {st.value}
                    <span className="metric-unit">{st.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sol-panels">
            <div className="panel sol-panel">
              <h3 className="metric-label">{intl.formatMessage(M.solImplTitle)}</h3>
              <ul className="sol-list">
                {s.implement.map((b) => (
                  <li key={b.msg.id}>
                    <i className="sol-icon" data-icon={b.icon} aria-hidden />
                    <span>{intl.formatMessage(b.msg)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel sol-panel">
              <h3 className="metric-label">{intl.formatMessage(M.solSolveTitle)}</h3>
              <ul className="sol-list">
                {s.solve.map((b) => (
                  <li key={b.msg.id}>
                    <i className="sol-icon" data-icon={b.icon} aria-hidden />
                    <span>{intl.formatMessage(b.msg)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sol-side">
            <figure className={`sol-figure panel${s.id === 'silos' ? ' silo-figure' : ''}`}>
              <span className="metric-label">{intl.formatMessage(M.solFigureTag)}</span>
              {s.id === 'silos' ? <SiloFigure /> : <FigurePlaceholder />}
              <figcaption className="metric-note">{intl.formatMessage(s.figure)}</figcaption>
            </figure>
            <div className="sol-steps">
              <h3 className="metric-label">{intl.formatMessage(M.solStepsTitle)}</h3>
              <ol>
                {s.steps.map((st, k) => (
                  <li key={st.id}>
                    <span className="sol-step-n">0{k + 1}</span>
                    <div>
                      <strong>{intl.formatMessage(STEP_TITLES[k])}</strong>
                      <p>{intl.formatMessage(st)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ))}

      <section id="contacto" className="sol sol-contact">
        <span className="kicker">
          <FormattedMessage {...M.contactKicker} />
        </span>
        <h2>
          <FormattedMessage {...M.contactTitle} />
        </h2>
        <p>
          <FormattedMessage {...M.contactBody} />
        </p>
        <button type="button" className="cta" onClick={onContact}>
          <span className="cta-label">
            <FormattedMessage {...M.finaleCta} />
          </span>
          <span className="cta-arrow" aria-hidden>→</span>
        </button>
        <span className="contact-line">
          <FormattedMessage {...M.contactLine} />
        </span>
        <span className="finale-fine">
          <FormattedMessage {...M.finaleFine} />
        </span>
      </section>
    </div>
  )
}
