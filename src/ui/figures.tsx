import type { CSSProperties } from 'react'

/** Shared bits for the schematic SVG illustrations. */

/** A dot that travels along `path` (CSS offset-path); `cmd` = command pulse. */
export function Pulse({ path, d, delay, cmd = false }: { path: string; d: string; delay: string; cmd?: boolean }) {
  const style = { offsetPath: `path('${path}')`, '--d': d, '--delay': delay } as CSSProperties
  return <circle className={`fig-pulse${cmd ? ' cmd' : ''}`} r="2.2" style={style} />
}

/** Three-blade fan glyph centred on (cx, cy), spinning. */
export function Fan({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  const k = r / 11
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <circle r="11" className="fig-node" />
      <g className="fig-fan-blades" fill="currentColor" opacity="0.9">
        <path d="M0 0 L0 -9 Q6 -6 2 0 Z" />
        <path d="M0 0 L8 5 Q3 8 0 4 Z" />
        <path d="M0 0 L-8 5 Q-8 -2 -2 -2 Z" />
      </g>
      <circle r="1.6" fill="currentColor" />
    </g>
  )
}

/** Small boxed device (node / controller / core) with a caption below. */
export function Box({
  x,
  y,
  w,
  h,
  label,
  accent = false,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  accent?: boolean
  children?: React.ReactNode
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" className="fig-node" />
      {children}
      <text x={x + w / 2} y={y + h + 12} textAnchor="middle" className={`fig-lbl${accent ? ' fig-lbl-accent' : ''}`}>
        {label}
      </text>
    </g>
  )
}

/** Growcast core mark: a crosshair with a dot. */
export function CoreMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path d={`M${cx - 12} ${cy} h24 M${cx} ${cy - 8} v16`} stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <circle cx={cx} cy={cy} r="3" fill="currentColor" />
    </g>
  )
}
