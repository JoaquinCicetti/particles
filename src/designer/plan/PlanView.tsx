import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { footprint, snap } from '../model/geometry'
import { isGrowcast, type Item, type ItemType } from '../model/schema'
import { glyphOf, itemTitle } from '../labels'
import { registerPlan } from '../snapshot'
import { getActiveDesign, useActiveDesign, useDesigner } from '../store'
import { GLYPHS } from '../ui/glyphs'

/**
 * Top-down plan in meters (SVG user units = m; +x right, +z down, matching
 * the 3D view from the front). Drag items (0.1 m snap), drag the background
 * to pan, wheel / pinch to zoom. A round zone (a silo) is drawn as a circle.
 */

type VB = { x: number; y: number; w: number; h: number }
type Pt = { x: number; y: number }
type Gesture =
  | { kind: 'item'; id: string; ox: number; oz: number; moved: boolean }
  | { kind: 'pan'; sx: number; sy: number; vb: VB; moved: boolean }
  | { kind: 'pinch'; dist: number }

function fitBox(W: number, L: number): VB {
  const m = Math.max(0.9, Math.max(W, L) * 0.1)
  return { x: -W / 2 - m * 1.3, y: -L / 2 - m * 1.3, w: W + m * 2.3, h: L + m * 2.3 }
}

function zoomAround(vb: VB, p: Pt, k: number): VB {
  const w = Math.min(400, Math.max(0.6, vb.w * k))
  const kk = w / vb.w
  return { x: p.x - (p.x - vb.x) * kk, y: p.y - (p.y - vb.y) * kk, w, h: vb.h * kk }
}

function toSvg(svg: SVGSVGElement | null, cx: number, cy: number): Pt | null {
  const m = svg?.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(cx, cy).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

/** Grid pitch that stays legible from a 3 m room to a 100 m one: [minor, major]. */
const gridSteps = (span: number): [number, number] => (span <= 20 ? [0.5, 1] : [1, 5])
const rulerStep = (span: number) => (span <= 12 ? 1 : span <= 40 ? 5 : 10)

const rank = (it: Item) => (it.type === 'sensor' ? 2 : ITEM_SPECS[it.type].mount === 'mounted' ? 1 : 0)

/** Types whose top view is drawn in full, so a glyph on top would only clutter it. */
const DRAWN = new Set<ItemType>(['rack', 'table', 'cheese_rack', 'hanger', 'pallet', 'trolley'])

export default function PlanView() {
  const intl = useIntl()
  const design = useActiveDesign()
  const tabId = useDesigner((s) => s.activeId)
  const nonce = useDesigner((s) => s.frameNonce)
  const selectedId = useDesigner((s) => s.selectedId)
  const { width: W, length: L } = design.room
  const round = design.room.shape === 'round'
  const clipId = `dz-plan-clip-${tabId}`

  // a pan/zoom sticks until the tab, the room size or a "frame" request changes
  const fitKey = `${tabId}|${W}|${L}|${nonce}`
  const [view, setView] = useState<{ key: string; vb: VB } | null>(null)
  const vb = view?.key === fitKey ? view.vb : fitBox(W, L)

  const svgRef = useRef<SVGSVGElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const pointers = useRef(new Map<number, Pt>())
  const vbRef = useRef(vb)
  const keyRef = useRef(fitKey)
  useEffect(() => {
    vbRef.current = vb
    keyRef.current = fitKey
  })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const p = toSvg(svg, e.clientX, e.clientY)
      if (!p) return
      const k = Math.exp((e.ctrlKey ? e.deltaY * 4 : e.deltaY) * 0.0015)
      const next = zoomAround(vbRef.current, p, k)
      vbRef.current = next
      setView({ key: keyRef.current, vb: next })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  // the PDF snapshot reads the plan straight from this SVG
  useEffect(() => registerPlan(() => svgRef.current), [])

  const setVb = (next: VB) => {
    vbRef.current = next
    setView({ key: keyRef.current, vb: next })
  }

  const onItemDown = (e: ReactPointerEvent, it: Item) => {
    if (e.button !== 0) return
    e.stopPropagation()
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    svgRef.current?.setPointerCapture(e.pointerId)
    useDesigner.getState().select(it.id)
    const p = toSvg(svgRef.current, e.clientX, e.clientY)
    if (!p) return
    gesture.current = { kind: 'item', id: it.id, ox: it.x - p.x, oz: it.z - p.y, moved: false }
  }

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.button !== 1) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture(e.pointerId)
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = { kind: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y) }
      return
    }
    gesture.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, vb: vbRef.current, moved: false }
  }

  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const pts = pointers.current
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (!g) return
    if (g.kind === 'item') {
      const p = toSvg(svgRef.current, e.clientX, e.clientY)
      const it = getActiveDesign().items.find((i) => i.id === g.id)
      if (!p || !it) return
      const x = snap(p.x + g.ox)
      const z = snap(p.y + g.oz)
      if (x === it.x && z === it.z) return
      const s = useDesigner.getState()
      if (!g.moved) {
        s.checkpoint()
        g.moved = true
      }
      s.updateItem(g.id, { x, z }, false)
    } else if (g.kind === 'pan') {
      const scale = svgRef.current?.getScreenCTM()?.a ?? 1
      const dx = e.clientX - g.sx
      const dy = e.clientY - g.sy
      if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true
      if (g.moved) setVb({ ...g.vb, x: g.vb.x - dx / scale, y: g.vb.y - dy / scale })
    } else if (pts.size >= 2) {
      const [a, b] = [...pts.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const p = toSvg(svgRef.current, (a.x + b.x) / 2, (a.y + b.y) / 2)
      if (p && dist > 0) setVb(zoomAround(vbRef.current, p, g.dist / dist))
      g.dist = dist
    }
  }

  const onUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (g?.kind === 'pan' && !g.moved) useDesigner.getState().select(null)
    if (!pointers.current.size || g?.kind === 'pinch') gesture.current = null
  }

  const unit = vb.w / 100

  const grid = useMemo(() => {
    const [minor, major] = gridSteps(Math.max(W, L))
    const every = Math.round(major / minor)
    const minorD: string[] = []
    const majorD: string[] = []
    // walk integer steps from the centre, so no float drift piles up
    for (let i = Math.ceil(-W / 2 / minor); i * minor <= W / 2 + 1e-6; i++)
      (i % every === 0 ? majorD : minorD).push(`M${i * minor} ${-L / 2}V${L / 2}`)
    for (let i = Math.ceil(-L / 2 / minor); i * minor <= L / 2 + 1e-6; i++)
      (i % every === 0 ? majorD : minorD).push(`M${-W / 2} ${i * minor}H${W / 2}`)
    return { minor: minorD.join(''), major: majorD.join('') }
  }, [W, L])

  const rulers = useMemo(() => {
    const step = rulerStep(Math.max(W, L))
    const off = unit * 2.4
    const tick = unit * 0.9
    const y0 = -L / 2 - off
    const x0 = -W / 2 - off
    let d = `M${-W / 2} ${y0}H${W / 2}M${x0} ${-L / 2}V${L / 2}`
    const labels: Array<{ key: string; x: number; y: number; t: string; anchor: 'middle' | 'end' }> = []
    for (let i = 0; i * step <= W + 1e-6; i++) {
      const x = -W / 2 + i * step
      d += `M${x} ${y0}v${-tick}`
      labels.push({ key: `x${i}`, x, y: y0 - tick * 1.6, t: String(i * step), anchor: 'middle' })
    }
    for (let i = 0; i * step <= L + 1e-6; i++) {
      const y = -L / 2 + i * step
      d += `M${x0} ${y}h${-tick}`
      labels.push({ key: `z${i}`, x: x0 - tick * 1.6, y: y + unit * 0.45, t: String(i * step), anchor: 'end' })
    }
    return { d, labels }
  }, [W, L, unit])

  const ordered = useMemo(() => {
    const list = [...design.items].sort((a, b) => rank(a) - rank(b))
    const i = list.findIndex((it) => it.id === selectedId)
    if (i >= 0) list.push(list.splice(i, 1)[0])
    return list
  }, [design.items, selectedId])

  return (
    <svg
      ref={svgRef}
      className="dz-plan"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label={intl.formatMessage(D.viewPlan)}
    >
      {round && (
        <defs>
          <clipPath id={clipId}>
            <circle r={W / 2} />
          </clipPath>
        </defs>
      )}
      {round ? (
        <circle className="dz-plan-floor" r={W / 2} />
      ) : (
        <rect className="dz-plan-floor" x={-W / 2} y={-L / 2} width={W} height={L} />
      )}
      <g clipPath={round ? `url(#${clipId})` : undefined}>
        <path className="dz-plan-minor" d={grid.minor} />
        <path className="dz-plan-major" d={grid.major} />
      </g>
      {round ? (
        <circle className="dz-plan-wall" r={W / 2} />
      ) : (
        <rect className="dz-plan-wall" x={-W / 2} y={-L / 2} width={W} height={L} />
      )}

      <path className="dz-plan-ruler" d={rulers.d} />
      {rulers.labels.map((l) => (
        <text key={l.key} className="dz-plan-text" x={l.x} y={l.y} fontSize={unit * 1.15} textAnchor={l.anchor}>
          {l.t}
        </text>
      ))}
      <text className="dz-plan-dim" x={0} y={-L / 2 - unit * 6} fontSize={unit * 1.5} textAnchor="middle">
        {round ? `Ø ${W.toFixed(2)} m` : `${W.toFixed(2)} m`}
      </text>
      {!round && (
        <text
          className="dz-plan-dim"
          transform={`translate(${-W / 2 - unit * 6.4} 0) rotate(-90)`}
          fontSize={unit * 1.5}
          textAnchor="middle"
        >
          {L.toFixed(2)} m
        </text>
      )}

      {ordered.map((it) => (
        <PlanItem
          key={it.id}
          it={it}
          unit={unit}
          selected={it.id === selectedId}
          title={itemTitle(intl, it, design.items)}
          onDown={(e) => onItemDown(e, it)}
        />
      ))}
    </svg>
  )
}

function PlanItem({
  it,
  unit,
  selected,
  title,
  onDown,
}: {
  it: Item
  unit: number
  selected: boolean
  title: string
  onDown: (e: ReactPointerEvent) => void
}) {
  const mounted = ITEM_SPECS[it.type].mount === 'mounted'
  const growcast = it.type === 'sensor' || isGrowcast(it.type)
  const cls = `dz-pi dz-pi-${it.type}${mounted ? ' is-mounted' : ''}${growcast ? ' is-growcast' : ''}${selected ? ' is-selected' : ''}`

  // sensors and the small Growcast devices are a few cm across: drawn to scale
  // they vanish, so they get a legible marker instead (the panel stays to scale)
  if (growcast && it.type !== 'growcast_industria') {
    const r = Math.max(0.09, unit * 1.05)
    const g = r * 1.3
    const tint = it.type === 'sensor' ? SENSOR_SPECS[it.sensorKind ?? 'air_temp_humidity'].tint : '#cad86e'
    return (
      <g className={`${cls} is-marker`} transform={`translate(${it.x} ${it.z})`} onPointerDown={onDown} style={{ '--tint': tint } as CSSProperties}>
        <title>{title}</title>
        <circle className="dz-pi-halo" r={r * 1.8} />
        <circle className="dz-pi-dot" r={r} />
        <path className="dz-pi-glyph" d={GLYPHS[glyphOf(it)]} transform={`translate(${-g / 2} ${-g / 2}) scale(${g / 16})`} />
      </g>
    )
  }

  const { w, d } = footprint(it)
  const gs = Math.min(Math.min(w, d) * 0.6, unit * 3.2)
  const showGlyph = !DRAWN.has(it.type) && gs > unit * 1.2
  return (
    <g className={cls} transform={`translate(${it.x} ${it.z})`} onPointerDown={onDown}>
      <title>{title}</title>
      <rect className="dz-pi-body" x={-w / 2} y={-d / 2} width={w} height={d} />
      <g transform={`rotate(${it.rotation * 90})`}>
        <Detail it={it} />
      </g>
      {showGlyph && (
        <path className="dz-pi-glyph" d={GLYPHS[glyphOf(it)]} transform={`translate(${-gs / 2} ${-gs / 2}) scale(${gs / 16})`} />
      )}
      {selected && (
        <text className="dz-pi-label" y={d / 2 + unit * 2.1} fontSize={unit * 1.15} textAnchor="middle">
          {w.toFixed(2)} × {d.toFixed(2)} m
        </text>
      )}
    </g>
  )
}

/** A closed circle as path data (so many of them can share one <path>). */
const ring = (cx: number, cz: number, r: number) =>
  `M${cx - r} ${cz}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

/** A dot per cell of a `pitch` grid over w × d; null past `max` dots. */
function dotGrid(w: number, d: number, pitch: number, radius: number, max = 600) {
  const nx = Math.max(1, Math.floor(w / pitch))
  const nz = Math.max(1, Math.floor(d / pitch))
  if (nx * nz > max) return null
  const r = Math.min(w / nx, d / nz) * radius
  let out = ''
  for (let i = 0; i < nx; i++)
    for (let k = 0; k < nz; k++) out += ring(((i + 0.5) * w) / nx - w / 2, ((k + 0.5) * d) / nz - d / 2, r)
  return out
}

/** Four corner posts, 4 cm square. */
function posts(w: number, d: number) {
  const p = 0.04
  return `M${-w / 2} ${-d / 2}h${p}v${p}h${-p}zM${w / 2 - p} ${-d / 2}h${p}v${p}h${-p}zM${-w / 2} ${d / 2 - p}h${p}v${p}h${-p}zM${w / 2 - p} ${d / 2 - p}h${p}v${p}h${-p}z`
}

/** Type-specific top-view detail, in the unrotated local frame. */
function Detail({ it }: { it: Item }) {
  const { width: w, depth: d } = it
  switch (it.type) {
    case 'rack':
    case 'table': {
      const dots = dotGrid(w, d, it.type === 'rack' ? 0.26 : 0.42, 0.28)
      if (dots === null) return null
      const outline = it.type === 'rack' ? posts(w, d) : `M${-w / 2 + 0.05} ${-d / 2 + 0.05}h${w - 0.1}v${d - 0.1}h${-(w - 0.1)}z`
      return (
        <>
          <path className="dz-pi-detail" d={outline} />
          <path className="dz-pi-plant" d={dots} />
        </>
      )
    }
    case 'cheese_rack': {
      const wheels = dotGrid(w, d, 0.35, 0.36)
      return (
        <>
          <path className="dz-pi-detail" d={posts(w, d)} />
          {wheels && <path className="dz-pi-cheese" d={wheels} />}
        </>
      )
    }
    case 'hanger': {
      let bars = ''
      let hanging = ''
      const n = Math.min(120, Math.max(1, Math.floor(w / 0.16)))
      for (const z of [-d * 0.22, d * 0.22]) {
        bars += `M${-w / 2} ${z}H${w / 2}`
        for (let i = 0; i < n; i++) hanging += ring(((i + 0.5) * w) / n - w / 2, z, 0.035)
      }
      return (
        <>
          <path className="dz-pi-detail" d={posts(w, d) + bars} />
          <path className="dz-pi-sausage" d={hanging} />
        </>
      )
    }
    case 'pallet': {
      let slats = ''
      for (let i = 0; i < 5; i++) {
        const x = -w / 2 + (w * (i + 0.5)) / 5
        slats += `M${x - w * 0.06} ${-d / 2}h${w * 0.12}v${d}h${-w * 0.12}z`
      }
      return <path className="dz-pi-detail" d={slats} />
    }
    case 'trolley': {
      const i = 0.08
      return <path className="dz-pi-detail" d={`${posts(w, d)}M${-w / 2 + i} ${-d / 2 + i}h${w - 2 * i}v${d - 2 * i}h${-(w - 2 * i)}z`} />
    }
    case 'light': {
      const bars = Math.min(10, Math.max(2, Math.round(w / 0.16)))
      const pitch = w / bars
      let path = ''
      for (let i = 0; i < bars; i++) path += `M${-w / 2 + pitch * (i + 0.5)} ${-d * 0.46}V${d * 0.46}`
      return <path className="dz-pi-led" d={path} />
    }
    // front-facing equipment: mark the face that blows or draws
    case 'climate':
    case 'cooler':
    case 'extractor':
    case 'aerator':
      return <path className="dz-pi-front" d={`M${-w / 2} ${d / 2}H${w / 2}`} />
    case 'fan': {
      const r = Math.min(w, d) * 0.42
      return <path className="dz-pi-detail" d={`M0 ${-r}a${r} ${r} 0 1 0 0.0001 0M0 0V${d / 2}`} />
    }
    case 'humidifier': {
      const r = Math.min(w, d) * 0.42
      return <circle className="dz-pi-detail" r={r} />
    }
    default:
      return null
  }
}
