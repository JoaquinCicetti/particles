/* eslint-disable react-refresh/only-export-components --
   the port helpers (SENSOR_PORT, PHONE_PORT, stackPorts) have to live beside
   the components whose geometry they describe; the cost is HMR for this file. */

import type { CSSProperties } from 'react'
import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { SENSOR_PATHS, type SensorIconKey } from './SensorIcon'

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

/* ────────────────────────────────────────────────────────────────────────
   Real Growcast hardware, abstracted to schematic line art.
   Geometry comes from the product SVGs; the load-bearing ratios are:
     device   2.28:1 landscape, two screw-terminal blocks on the bottom edge
     expander 1:4.03 portrait, pin column in groups of four
     module   square, two screw circles on the bottom edge, side pins, an LED
     sensor   1:2.64 portrait, trapezoid gland cap, bands at 31.6% / 79.4%,
              two symmetric louvre stacks at the bottom
   Everything below is authored at scale 1 and placed with translate/scale so
   the same product reads identically in all three figures.
   ──────────────────────────────────────────────────────────────────────── */

/** Growcast sensor pod (12 × 33.9 at s = 1). Cable gland on top. */
export function SensorNode({ x, y, kind, s = 1 }: { x: number; y: number; kind: SensorIconKey; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cable gland cap */}
      <path className="fig-chassis" d="M4.2 0 H7.8 L9.8 2.2 H2.2 Z" />
      <rect className="fig-chassis" x="0" y="2.2" width="12" height="31.7" rx="0.9" />
      {/* seam bands at 31.6 % and 79.4 % of the body */}
      <path className="fig-pin" d="M0 12.2 H12 M0 27.4 H12" />
      <g className="fig-sensor-glyph" transform="translate(2.4 4.4) scale(0.45)">
        <path d={SENSOR_PATHS[kind]} />
      </g>
      {/* two symmetric louvre stacks */}
      <g className="fig-vent">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M1.5 ${28.6 + i * 1.6} H5.4 M6.6 ${28.6 + i * 1.6} H10.5`} />
        ))}
      </g>
    </g>
  )
}

/** Where a sensor pod's cable leaves the gland cap. */
export const SENSOR_PORT = (x: number, y: number, s = 1) => ({ x: x + 6 * s, y })

/** The Growcast controller: 64 × 28 body, terminals overhanging to y = 30. */
export function GrowcastDevice({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className="fig-chassis" x="0" y="0" width="64" height="28" rx="1.4" />
      {/* linked-nodes brand mark */}
      <g className="fig-mark">
        <path d="M6 13 L11.5 7.5 L17.5 12" fill="none" />
        <circle cx="6" cy="13" r="1.5" />
        <circle cx="11.5" cy="7.5" r="1.5" />
        <circle cx="17.5" cy="12" r="1.5" />
      </g>
      {/* louvre combs flanking the right-hand connector */}
      <g className="fig-vent">
        <path d="M49.5 7.6 V9.8 M52 7.6 V9.8 M54.5 7.6 V9.8 M57 7.6 V9.8 M59.5 7.6 V9.8" />
        <path d="M49.5 19.2 V21.4 M52 19.2 V21.4 M54.5 19.2 V21.4 M57 19.2 V21.4 M59.5 19.2 V21.4" />
      </g>
      <rect className="fig-chassis" x="48" y="11" width="13" height="7" rx="0.8" />
      <path className="fig-pin" d="M51 12.8 V16.2 M54.5 12.8 V16.2 M58 12.8 V16.2" />
      {/* LED pair, top-right — own <g> so the .fig-led stagger stays local */}
      <g>
        <circle className="fig-led" cx="53" cy="4" r="1.3" />
        <circle className="fig-led" cx="58.5" cy="4" r="1.3" />
      </g>
      {/* the identity cue: two screw-terminal blocks straddling the bottom edge */}
      <g>
        <rect className="fig-chassis" x="11.5" y="22" width="13" height="8" rx="0.8" />
        <path className="fig-pin" d="M11.5 24.4 H24.5" />
        <circle className="fig-pin" cx="15" cy="27" r="1.4" fill="none" />
        <circle className="fig-pin" cx="21" cy="27" r="1.4" fill="none" />
      </g>
      <g>
        <rect className="fig-chassis" x="27.5" y="22" width="13" height="8" rx="0.8" />
        <path className="fig-pin" d="M27.5 24.4 H40.5" />
        <circle className="fig-pin" cx="31" cy="27" r="1.4" fill="none" />
        <circle className="fig-pin" cx="37" cy="27" r="1.4" fill="none" />
      </g>
    </g>
  )
}

/** The I/O expander: 12 × 48.4 at s = 1 (1 : 4.03). */
export function Expander({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className="fig-chassis" x="0" y="0" width="12" height="48.4" rx="1" />
      <circle className="fig-mark" cx="3.4" cy="3.6" r="1.3" />
      <circle className="fig-mark" cx="3.4" cy="44.8" r="1.3" />
      <g className="fig-pin">
        {[0, 1, 2].map((g) =>
          [0, 1, 2, 3].map((i) => <path key={`${g}-${i}`} d={`M6.4 ${6.5 + g * 13 + i * 3} H10.6`} />),
        )}
      </g>
    </g>
  )
}

/** A control module: 16 × 15 at s = 1, terminals on the bottom edge. */
export function ControlModule({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className="fig-chassis" x="0" y="0" width="16" height="15" rx="1" />
      <g className="fig-pin">
        <path d="M1.2 3.4 H4.6 M1.2 6 H4.6 M1.2 8.6 H4.6 M1.2 11.2 H4.6" />
      </g>
      <g>
        <circle className="fig-led" cx="12" cy="4.2" r="1.4" />
      </g>
      <path className="fig-pin" d="M7 8.4 H14" />
      <circle className="fig-chassis" cx="4.6" cy="15" r="1.7" />
      <circle className="fig-chassis" cx="11.4" cy="15" r="1.7" />
    </g>
  )
}

/** Expanding arcs: the live uplink, radiating down toward the phone. */
export function UplinkArc({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="1.6" fill="currentColor" />
      {[7, 12, 17].map((r, i) => (
        <path
          key={r}
          className="fig-uplink"
          d={`M${(-0.64 * r).toFixed(1)} ${(0.77 * r).toFixed(1)} A ${r} ${r} 0 0 0 ${(0.64 * r).toFixed(1)} ${(0.77 * r).toFixed(1)}`}
          style={{ ['--delay' as string]: `${i * 0.45}s` }}
        />
      ))}
    </g>
  )
}

const PHONE_W = 44
const PHONE_H = 88

/** Where the uplink meets the phone: the top edge, centred. */
export const PHONE_PORT = (x: number, y: number, s = 1) => ({ x: x + (PHONE_W / 2) * s, y })

/**
 * A phone rendering the Growcast app. Deliberately TEXT-FREE: at the mobile
 * render scale any glyph inside would be ≤ 4 px, so the screen speaks in
 * shapes only — sparkline, metric rows, a gauge, a live dot.
 */
export function PhoneCard({ x, y, s = 1, metrics }: { x: number; y: number; s?: number; metrics: SensorIconKey[] }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect className="fig-chassis" x="0" y="0" width={PHONE_W} height={PHONE_H} rx="5" />
      <rect className="fig-screen" x="2.6" y="6" width="38.8" height="74" rx="2.6" />
      <rect x="17" y="2.6" width="10" height="1.6" rx="0.8" fill="currentColor" opacity="0.5" />
      <rect x="17" y="83" width="10" height="1.4" rx="0.7" fill="currentColor" opacity="0.5" />

      {/* header: brand bar + live dot */}
      <rect x="6" y="9.4" width="13" height="2.2" rx="1.1" fill="currentColor" opacity="0.45" />
      <circle className="fig-live" cx="37" cy="10.5" r="1.5" />
      <path className="fig-pin" d="M6 14.8 H38" />

      {/* hero sparkline */}
      <polyline className="fig-spark" points="6,30.5 10,26 14,28.5 18,21.5 22,24.5 26,18.5 30,22.5 34,17 38,19.5" />
      <path className="fig-pin" d="M6 33.4 H38" />

      {/* metric rows: glyph + label bar + value chip */}
      {metrics.slice(0, 2).map((k, i) => {
        const ry = 38.5 + i * 11.5
        return (
          <g key={`${k}-${i}`}>
            <g className="fig-sensor-glyph" transform={`translate(6 ${ry}) scale(0.5)`}>
              <path d={SENSOR_PATHS[k]} />
            </g>
            <rect x="16.5" y={ry + 1.4} width="11.5" height="1.9" rx="0.95" fill="currentColor" opacity="0.34" />
            <rect x="16.5" y={ry + 4.8} width="7.5" height="1.5" rx="0.75" fill="currentColor" opacity="0.18" />
            <rect className="fig-chip" x="29.5" y={ry + 0.8} width="8.5" height="6.4" rx="1.4" />
          </g>
        )
      })}

      {/* setpoint gauge */}
      <rect className="fig-pin" x="6" y="63.5" width="32" height="3.6" rx="1.8" fill="none" />
      <rect className="fig-gauge" x="6" y="63.5" width="32" height="3.6" rx="1.8" />

      {/* nav pips */}
      <g>
        <circle cx="14" cy="74" r="1.3" fill="currentColor" opacity="0.75" />
        <circle cx="22" cy="74" r="1.3" fill="currentColor" opacity="0.3" />
        <circle cx="30" cy="74" r="1.3" fill="currentColor" opacity="0.3" />
      </g>
    </g>
  )
}

/** Port coordinates of a <GrowcastStack> placed at (x, y). */
export function stackPorts(x: number, y: number) {
  return {
    /** left edge of the device, mid-height — where the sense bus arrives */
    sensorIn: { x, y: y + 20 },
    /** origin of the uplink arcs */
    uplink: { x: x + 106, y: y + 96 },
    /** left edge of control module i — where its command leaves for the room */
    modOut: (i: number) => ({ x: x + 98, y: y + 2 + i * 22 + 6.75 }),
  }
}

/**
 * The product itself: controller + expander + N control modules on a DIN
 * rail, wired together. One component, so the hardware reads identically in
 * every figure. Inter-part wires are drawn first so they tuck under the
 * filled chassis.
 */
export function GrowcastStack({ x, y, modules }: { x: number; y: number; modules: number }) {
  const intl = useIntl()
  const n = Math.max(1, Math.min(3, modules))
  const mods = Array.from({ length: n }, (_, i) => y + 2 + i * 22)
  const cys = mods.map((my) => my + 6.75)
  const busTop = Math.min(y + 17.4, cys[0])
  const busBottom = Math.max(y + 17.4, cys[cys.length - 1])
  const railBottom = Math.max(y + 34.9, mods[mods.length - 1] + 13.5)

  return (
    <g>
      {/* inter-part links, drawn under the bodies */}
      <g className="fig-link">
        <path d={`M${x + 64} ${y + 20} H${x + 69} V${y + 17.4} H${x + 74}`} />
        <path d={`M${x + 82.6} ${y + 17.4} H${x + 90}`} />
        <path d={`M${x + 90} ${busTop} V${busBottom}`} />
        {cys.map((cy) => (
          <path key={cy} d={`M${x + 90} ${cy} H${x + 98}`} />
        ))}
      </g>

      {/* DIN rail */}
      <g className="fig-rail">
        <path d={`M${x + 72} ${y - 4} H${x + 118} M${x + 72} ${y - 1} H${x + 118}`} />
      </g>

      <GrowcastDevice x={x} y={y + 6} />
      <Expander x={x + 74} y={y} s={0.72} />
      {mods.map((my) => (
        <ControlModule key={my} x={x + 98} y={my} s={0.9} />
      ))}

      <text x={x + 32} y={y + 2} textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.figSensors)}
      </text>
      <text x={x + 32} y={y + 48} textAnchor="middle" className="fig-lbl fig-lbl-accent">
        {intl.formatMessage(M.siloLblCore)}
      </text>
      <text x={x + 93} y={railBottom + 9} textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.figExpander)}
      </text>
      <text x={x + 93} y={railBottom + 18} textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(n === 1 ? M.figModule : M.figModules)}
      </text>
    </g>
  )
}
