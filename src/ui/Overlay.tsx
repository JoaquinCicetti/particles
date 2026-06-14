import { useEffect, useRef, useState } from 'react'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'
import ContactDialog from './ContactDialog'

const METRICS = [
  { label: 'TEMPERATURA', value: '18.4', unit: '°C', note: 'Δ −0.3 / 24H', bar: 0.42, range: [0.16, 0.24], side: 'left' },
  { label: 'HUMEDAD', value: '61.2', unit: '%HR', note: 'ESTABLE', bar: 0.61, range: [0.2, 0.28], side: 'right' },
  { label: 'CO₂', value: '412', unit: 'PPM', note: 'NOMINAL', bar: 0.28, range: [0.24, 0.32], side: 'left' },
  { label: 'CONDUCTIVIDAD', value: '1.9', unit: 'mS/cm', note: 'EC · ÓPTIMO', bar: 0.55, range: [0.28, 0.36], side: 'right' },
  { label: 'pH', value: '6.3', unit: '', note: 'EN RANGO', bar: 0.63, range: [0.32, 0.4], side: 'left' },
  { label: 'FLUJO DE AIRE', value: '1.8', unit: 'M/S', note: 'ÓPTIMO', bar: 0.74, range: [0.36, 0.44], side: 'right' },
] as const

const PHASES: Array<[number, string]> = [
  [0, '01 / EL ESTABLECIMIENTO'],
  [0.16, '02 / RED DE SENSORES'],
  [0.32, '03 / FLUJO DE DATOS'],
  [0.5, '04 / DATOS ESTRUCTURADOS'],
  [0.62, '05 / CONVERGENCIA'],
  [0.88, '06 / GROWCAST'],
]

export default function Overlay() {
  const root = useRef<HTMLDivElement>(null)
  const [contactOpen, setContactOpen] = useState(false)

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
        let label = PHASES[0][1]
        for (const [at, text] of PHASES) if (p >= at) label = text
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
        <a className="brand" href="#top" aria-label="Growcast Agro — inicio">
          <span className="brand-mark" aria-hidden />
          <span className="wordmark">GROWCAST</span>
          <span className="brand-sub">AGRO</span>
        </a>
        <div className="nav-right">
          <button type="button" className="nav-cta" onClick={() => setContactOpen(true)}>
            COORDINAR REUNIÓN
          </button>
        </div>
      </nav>

      <header className="hero" data-hero>
        <span className="kicker">PLATAFORMA DE MONITOREO AGRÍCOLA</span>
        <h1>
          Tu campo,
          <br />
          en tiempo real<span className="accent">.</span>
        </h1>
        <p>
          Growcast integra silos, depósitos y cultivos en una sola plataforma de monitoreo.
          Datos en tiempo real, del campo a la decisión.
        </p>
      </header>

      <section className="block block-center" data-window="0.16,0.3">
        <span className="kicker">RED DE SENSORES</span>
        <h2>Todo el establecimiento, una sola red.</h2>
        <p>
          Temperatura, humedad, CO₂, conductividad y pH: cada variable, en cada punto,
          transmitiendo a un núcleo central.
        </p>
      </section>

      {METRICS.map((m) => (
        <div key={m.label} className={`metric metric-${m.side}`} data-metric>
          <span className="metric-label">{m.label}</span>
          <div className="metric-value">
            {m.value}
            <span className="metric-unit">{m.unit}</span>
          </div>
          <div className="metric-bar">
            <i style={{ width: `${m.bar * 100}%` }} />
          </div>
          <span className="metric-note">{m.note}</span>
        </div>
      ))}

      <section className="block block-left" data-window="0.5,0.6">
        <span className="kicker">DATOS ESTRUCTURADOS</span>
        <h2>El dato crudo se vuelve estructura.</h2>
        <p>
          Series temporales, umbrales y alertas tempranas: cada variable, ordenada y lista para
          decidir.
        </p>
      </section>

      <section className="block block-left" data-window="0.64,0.85">
        <span className="kicker">MEDIR · CONTROLAR · TRAZAR</span>
        <h2>Todo converge en Growcast.</h2>
        <p>
          Medimos cada variable, controlamos riego y clima, y trazamos cada lote —del sensor a la
          decisión, en una sola fuente de verdad.
        </p>
      </section>

      <footer className="finale" data-finale>
        <span className="finale-word">
          GROWCAST<span className="finale-sub">AGRO</span>
        </span>
        <span className="finale-tag">MEDIR · CONTROLAR · TRAZAR</span>
        <button type="button" className="cta" onClick={() => setContactOpen(true)}>
          <span className="cta-label">Coordinar una reunión</span>
          <span className="cta-arrow" aria-hidden>→</span>
        </button>
        <span className="finale-fine">GROWCAST AGRO © 2026 — INTELIGENCIA AGRÍCOLA</span>
      </footer>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />

      <div className="hint" data-hint>
        <span>DESPLAZÁ PARA EXPLORAR</span>
        <i />
      </div>

      <div className="rail" aria-hidden>
        <div className="rail-track">
          <div className="rail-fill" data-rail-fill />
          <div className="rail-dot" data-rail-dot />
        </div>
      </div>

      <div className="phase" data-phase aria-hidden>
        01 / EL ESTABLECIMIENTO
      </div>

      <div className="grain" aria-hidden />
    </div>
  )
}
