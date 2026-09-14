import { useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import type { MessageDescriptor } from 'react-intl'
import { M } from '../i18n/messages'
import { setSection } from '../lib/scroll'
import { EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from '../lib/contact'
import { DESIGNER_PATHS, loadDesigner, onNavClick } from '../lib/route'
import ContactCta from './ContactCta'
import SiloFigure from './SiloFigure'
import GrowRoomFigure from './GrowRoomFigure'
import CuringRoomFigure from './CuringRoomFigure'

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
  /** this solution's 3D designer */
  design: { path: string; cta: MessageDescriptor; note: MessageDescriptor }
}

const STEP_TITLES = [M.step1Title, M.step2Title, M.step3Title] as const

// DRAFT data — values are illustrative
const SOLUTIONS: Solution[] = [
  {
    id: 'silos',
    n: '01',
    kicker: M.silosKicker,
    title: M.silosTitle,
    lede: M.silosLede,
    who: M.silosWho,
    measures: [M.varTempIn, M.varHumIn, M.varCo2, M.varTempOut, M.varHumOut, M.varFans, M.varHours],
    steps: [M.silosStep1, M.silosStep2, M.silosStep3],
    implement: [
      { icon: 'fan', msg: M.silosImpl1 },
      { icon: 'fan', msg: M.silosImpl2 },
      { icon: 'phone', msg: M.silosImpl3 },
      { icon: 'log', msg: M.silosImpl4 },
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
      { label: M.silosStat3, value: '62', unit: '%HR' },
    ],
    figure: M.silosFigure,
    design: { path: DESIGNER_PATHS.silo, cta: M.silosDesignCta, note: M.silosDesignNote },
  },
  {
    id: 'cultivo',
    n: '02',
    kicker: M.cultivoKicker,
    title: M.cultivoTitle,
    lede: M.cultivoLede,
    who: M.cultivoWho,
    measures: [M.varTemp, M.varHum, M.varCo2, M.varVpd, M.varSubstrate, M.varEc, M.varPh, M.varEquip],
    steps: [M.cultivoStep1, M.cultivoStep2, M.cultivoStep3],
    implement: [
      { icon: 'fan', msg: M.cultivoImpl1 },
      { icon: 'snow', msg: M.cultivoImpl2 },
      { icon: 'valve', msg: M.cultivoImpl3 },
      { icon: 'co2', msg: M.cultivoImpl4 },
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
    design: { path: DESIGNER_PATHS.grow, cta: M.cultivoDesignCta, note: M.designNote },
  },
  {
    id: 'maduracion',
    n: '03',
    kicker: M.maduracionKicker,
    title: M.maduracionTitle,
    lede: M.maduracionLede,
    who: M.maduracionWho,
    measures: [M.varTemp, M.varHum, M.varCo2IfApplies, M.varEquip, M.varHours],
    steps: [M.maduracionStep1, M.maduracionStep2, M.maduracionStep3],
    implement: [
      { icon: 'fan', msg: M.maduracionImpl1 },
      { icon: 'snow', msg: M.maduracionImpl2 },
      { icon: 'node', msg: M.maduracionImpl3 },
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
      { label: M.maduracionStat3, value: '650', unit: 'PPM' },
    ],
    figure: M.maduracionFigure,
    design: { path: DESIGNER_PATHS.curing, cta: M.maduracionDesignCta, note: M.designNote },
  },
]

const FIGURES: Record<string, React.ReactNode> = {
  cultivo: <GrowRoomFigure />,
  silos: <SiloFigure />,
  maduracion: <CuringRoomFigure />,
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
            <div className="sol-design">
              <a
                className="cta"
                href={s.design.path}
                onClick={onNavClick}
                onPointerEnter={() => void loadDesigner()}
                onFocus={() => void loadDesigner()}
              >
                <span className="cta-label">{intl.formatMessage(s.design.cta)}</span>
                <span className="cta-arrow" aria-hidden>→</span>
              </a>
              <span className="metric-note">{intl.formatMessage(s.design.note)}</span>
            </div>
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

          <figure className="sol-figure panel fig-panel">
            <span className="metric-label">{intl.formatMessage(M.solFigureTag)}</span>
            {FIGURES[s.id]}
            <figcaption className="metric-note">{intl.formatMessage(s.figure)}</figcaption>
          </figure>

          <div className="sol-side">
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
        <ContactCta onClick={onContact} />
        <div className="contact-line">
          <span>
            <FormattedMessage {...M.contactLocation} />
          </span>
          <a className="contact-link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden>
              <path d="M4.3 19.7l1-3.6A8.2 8.2 0 1 1 8 18.8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path
                d="M9.2 8.1c.2-.4.4-.5.7-.5h.5c.2 0 .3.1.4.3l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.1-.1.3 0 .4.5.9 1.3 1.6 2.2 2.1.1.1.3.1.4 0l.6-.7c.1-.1.3-.2.5-.1l1.6.7c.2.1.3.2.3.4v.5c0 .3-.1.6-.5.8-.5.3-1.4.5-2.7-.1-1.3-.5-2.6-1.8-3.3-3-.7-1.2-.7-2.3-.3-2.9z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">WhatsApp </span>
            {WHATSAPP_DISPLAY}
          </a>
          <a className="contact-link" href={`mailto:${EMAIL}`}>
            <svg className="contact-icon" viewBox="0 0 24 24" aria-hidden>
              <rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.8 7.2 12 13l8.2-5.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            {EMAIL}
          </a>
        </div>
        <span className="finale-fine">
          <FormattedMessage {...M.finaleFine} />
        </span>
      </section>
    </div>
  )
}
