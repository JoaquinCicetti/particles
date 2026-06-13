import { useEffect, useRef } from 'react'
import { scrollState } from '../lib/scroll'
import { fadeWindow, lerp, smoothstep } from '../lib/math'

// TODO: point at the real scheduling tool (Calendly / Cal.com) when ready
const SCHEDULE_URL = '#agenda'

const METRICS = [
  { label: 'TEMPERATURA', value: '18.4', unit: '°C', note: 'Δ −0.3 / 24H', bar: 0.42, range: [0.34, 0.42], side: 'left' },
  { label: 'HUMEDAD', value: '61.2', unit: '%HR', note: 'ESTABLE', bar: 0.61, range: [0.38, 0.46], side: 'right' },
  { label: 'CO₂', value: '412', unit: 'PPM', note: 'NOMINAL', bar: 0.28, range: [0.42, 0.5], side: 'left' },
  { label: 'FLUJO DE AIRE', value: '1.8', unit: 'M/S', note: 'ÓPTIMO', bar: 0.74, range: [0.46, 0.54], side: 'right' },
] as const

const PHASES: Array<[number, string]> = [
  [0, '01 / VISTA DEL SITIO'],
  [0.16, '02 / RED DE TELEMETRÍA'],
  [0.3, '03 / FLUJO DEL ELEVADOR'],
  [0.48, '04 / SÍNTESIS DE DATOS'],
  [0.64, '05 / CONVERGENCIA'],
  [0.78, '06 / PLACA INDUSTRIAL'],
  [0.92, '07 / GROWCAST'],
]

export default function Overlay() {
  const root = useRef<HTMLDivElement>(null)

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
        const o = smoothstep(0.93, 0.985, p)
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
        <a className="brand" href="#top" aria-label="Growcast — inicio">
          <span className="brand-mark" aria-hidden />
          <span className="wordmark">GROWCAST</span>
        </a>
        <a className="nav-cta" href={SCHEDULE_URL}>
          AGENDAR REUNIÓN
        </a>
      </nav>

      <header className="hero" data-hero>
        <span className="kicker">PLATAFORMA DE INTELIGENCIA DE GRANOS</span>
        <h1>
          Silos que
          <br />
          sienten<span className="accent">.</span>
        </h1>
        <p>
          Growcast convierte los silos en instrumentos vivos: millones de datos fluyendo del
          grano a la decisión, en tiempo real.
        </p>
      </header>

      <section className="block block-right" data-window="0.15,0.3">
        <span className="kicker">LA RED</span>
        <h2>Tres silos. Un solo torrente.</h2>
        <p>
          Hilos de cobre de telemetría conectan cada sensor con el elevador central: nada se
          mueve sin medirse.
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

      <section className="block block-left" data-window="0.55,0.64">
        <span className="kicker">DEL MOVIMIENTO AL SIGNIFICADO</span>
        <h2>El flujo crudo se vuelve información estructurada.</h2>
        <p>
          Las corrientes se resuelven en series de tiempo, umbrales y pronósticos: el idioma de
          tu operación.
        </p>
      </section>

      <section className="block block-center" data-window="0.65,0.74">
        <span className="kicker">UNA SOLA FUENTE DE VERDAD</span>
        <h2>Todo converge.</h2>
      </section>

      <section className="block block-right" data-window="0.77,0.89">
        <span className="kicker">DEL DATO AL DISPOSITIVO</span>
        <h2>Hardware diseñado para el grano.</h2>
        <p>
          Sensores, módulos de expansión y la placa de control Growcast: la inteligencia
          ambiental, hecha hierro.
        </p>
      </section>

      <footer className="finale" data-finale>
        <span className="finale-word">GROWCAST</span>
        <span className="finale-tag">MONITOREAR · PREDECIR · PROTEGER</span>
        <a className="cta" href={SCHEDULE_URL} id="agenda">
          Agendar una reunión
        </a>
        <span className="finale-fine">GROWCAST © 2026 — INTELIGENCIA DE GRANOS</span>
      </footer>

      <div className="hint" data-hint>
        <span>DESPLAZATE PARA ENTRAR AL FLUJO</span>
        <i />
      </div>

      <div className="rail" aria-hidden>
        <div className="rail-track">
          <div className="rail-fill" data-rail-fill />
          <div className="rail-dot" data-rail-dot />
        </div>
      </div>

      <div className="phase" data-phase aria-hidden>
        01 / VISTA DEL SITIO
      </div>

      <div className="grain" aria-hidden />
    </div>
  )
}
