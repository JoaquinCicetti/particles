import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { ITEM_SPECS, SENSOR_SPECS } from '../model/catalog'
import { footprint, snap } from '../model/geometry'
import type { Item } from '../model/schema'
import { glyphOf, itemTitle } from '../labels'
import { getActiveDesign, useActiveDesign, useDesigner } from '../store'
import { GLYPHS } from '../ui/glyphs'

/**
 * Top-down plan in meters (SVG user units = m; +x right, +z down, matching
 * the 3D view from the front). Drag items (0.1 m snap), drag the background
 * to pan, wheel / pinch to zoom.
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

const rank = (it: Item) => (it.type === 'sensor' ? 2 : ITEM_SPECS[it.type].mount === 'mounted' ? 1 : 0)

export default function PlanView() {
  const intl = useIntl()
  const design = useActiveDesign()
  const tabId = useDesigner((s) => s.activeId)
  const nonce = useDesigner((s) => s.frameNonce)
  const selectedId = useDesigner((s) => s.selectedId)
  const { width: W, length: L } = design.room

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
    const minor: string[] = []
    const major: string[] = []
    const isMajor = (v: number) => Math.abs(v - Math.round(v)) < 1e-6
    for (let v = Math.ceil((-W / 2) * 2) / 2; v <= W / 2 + 1e-6; v += 0.5)
      (isMajor(v) ? major : minor).push(`M${v} ${-L / 2}V${L / 2}`)
    for (let v = Math.ceil((-L / 2) * 2) / 2; v <= L / 2 + 1e-6; v += 0.5)
      (isMajor(v) ? major : minor).push(`M${-W / 2} ${v}H${W / 2}`)
    return { minor: minor.join(''), major: major.join('') }
  }, [W, L])

  const rulers = useMemo(() => {
    const step = Math.max(W, L) <= 12 ? 1 : Math.max(W, L) <= 40 ? 5 : 10
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
      <rect className="dz-plan-floor" x={-W / 2} y={-L / 2} width={W} height={L} />
      <path className="dz-plan-minor" d={grid.minor} />
      <path className="dz-plan-major" d={grid.major} />
      <rect className="dz-plan-wall" x={-W / 2} y={-L / 2} width={W} height={L} />

      <path className="dz-plan-ruler" d={rulers.d} />
      {rulers.labels.map((l) => (
        <text key={l.key} className="dz-plan-text" x={l.x} y={l.y} fontSize={unit * 1.15} textAnchor={l.anchor}>
          {l.t}
        </text>
      ))}
      <text className="dz-plan-dim" x={0} y={-L / 2 - unit * 6} fontSize={unit * 1.5} textAnchor="middle">
        {W.toFixed(2)} m
      </text>
      <text
        className="dz-plan-dim"
        transform={`translate(${-W / 2 - unit * 6.4} 0) rotate(-90)`}
        fontSize={unit * 1.5}
        textAnchor="middle"
      >
        {L.toFixed(2)} m
      </text>

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
  const cls = `dz-pi dz-pi-${it.type}${mounted ? ' is-mounted' : ''}${selected ? ' is-selected' : ''}`

  if (it.type === 'sensor') {
    const r = Math.max(0.09, unit * 1.05)
    const g = r * 1.3
    const tint = SENSOR_SPECS[it.sensorKind ?? 'air_temp_humidity'].tint
    return (
      <g className={cls} transform={`translate(${it.x} ${it.z})`} onPointerDown={onDown} style={{ '--tint': tint } as CSSProperties}>
        <title>{title}</title>
        <circle className="dz-pi-halo" r={r * 1.8} />
        <circle className="dz-pi-dot" r={r} />
        <path className="dz-pi-glyph" d={GLYPHS[glyphOf(it)]} transform={`translate(${-g / 2} ${-g / 2}) scale(${g / 16})`} />
      </g>
    )
  }

  const { w, d } = footprint(it)
  const gs = Math.min(Math.min(w, d) * 0.6, unit * 3.2)
  const showGlyph = it.type !== 'rack' && it.type !== 'table' && gs > unit * 1.2
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

/** Type-specific top-view detail, in the unrotated local frame. */
function Detail({ it }: { it: Item }) {
  const { width: w, depth: d } = it
  switch (it.type) {
    case 'rack':
    case 'table': {
      const pitch = it.type === 'rack' ? 0.26 : 0.42
      const nx = Math.max(1, Math.floor(w / pitch))
      const nz = Math.max(1, Math.floor(d / pitch))
      if (nx * nz > 600) return null
      const r = Math.min(w / nx, d / nz) * 0.28
      let dots = ''
      for (let i = 0; i < nx; i++)
        for (let k = 0; k < nz; k++) {
          const cx = ((i + 0.5) * w) / nx - w / 2
          const cz = ((k + 0.5) * d) / nz - d / 2
          dots += `M${cx - r} ${cz}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`
        }
      const p = 0.04
      const posts =
        it.type === 'rack'
          ? `M${-w / 2} ${-d / 2}h${p}v${p}h${-p}zM${w / 2 - p} ${-d / 2}h${p}v${p}h${-p}zM${-w / 2} ${d / 2 - p}h${p}v${p}h${-p}zM${w / 2 - p} ${d / 2 - p}h${p}v${p}h${-p}z`
          : `M${-w / 2 + 0.05} ${-d / 2 + 0.05}h${w - 0.1}v${d - 0.1}h${-(w - 0.1)}z`
      return (
        <>
          <path className="dz-pi-detail" d={posts} />
          <path className="dz-pi-plant" d={dots} />
        </>
      )
    }
    case 'light': {
      const bars = Math.min(10, Math.max(2, Math.round(w / 0.16)))
      const pitch = w / bars
      let path = ''
      for (let i = 0; i < bars; i++) path += `M${-w / 2 + pitch * (i + 0.5)} ${-d * 0.46}V${d * 0.46}`
      return <path className="dz-pi-led" d={path} />
    }
    case 'climate':
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
