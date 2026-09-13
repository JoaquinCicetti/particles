/* eslint-disable react-refresh/only-export-components --
   the port helpers (SENSOR_PORT, PHONE_PORT, stackPorts) have to live beside
   the components whose geometry they describe; the cost is HMR for this file. */

import type { CSSProperties } from 'react'
import { BRAND_MARK, BRAND_MARK_VIEWBOX } from './brandMark'
import { SENSOR_PATHS, type SensorIconKey } from './SensorIcon'

/** Shared bits for the schematic SVG illustrations. */

/** A dot that travels along `path` (CSS offset-path); `cmd` = command pulse. */
export function Pulse({ path, d, delay, cmd = false }: { path: string; d: string; delay: string; cmd?: boolean }) {
  const style = {
    offsetPath: `path('${path}')`,
    '--d': d,
    '--delay': delay,
  } as CSSProperties
  return <circle className={`fig-pulse${cmd ? ' cmd' : ''}`} r="2.2" style={style} />
}

/**
 * One propeller blade, authored pointing up from a hub at the origin, for a
 * guard of radius 11. Four of them at 90° give the blade set FOUR-FOLD
 * rotational symmetry, which is what actually centres the spin: `.fig-fan-blades`
 * turns about `transform-box: fill-box; transform-origin: center`, i.e. the
 * centre of the blades' BOUNDING BOX. Only a 4-fold shape is guaranteed a
 * square bbox centred on the hub — with the old three lopsided blades that
 * centre sat off the hub and the whole helix wobbled.
 */
const FAN_BLADE = 'M0 -2.6 C3.6 -3.3 5.8 -5.7 5.3 -7.9 C4.8 -9.8 2.5 -10 1.2 -8.5 C0.4 -7.5 0.15 -5.2 0 -2.6 Z'
const FAN_ANGLES = [0, 90, 180, 270]

/** Four-blade fan glyph centred on (cx, cy), spinning about its hub. */
export function Fan({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  const k = r / 11
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      <circle r="11" className="fig-node" />
      {/* finger guard, so the glyph reads as a guarded appliance */}
      <circle r="10" className="fig-pin" fill="none" />
      <g className="fig-fan-blades" fill="currentColor" opacity="0.9">
        {FAN_ANGLES.map((a) => (
          <path key={a} d={FAN_BLADE} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r="2" fill="currentColor" />
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
     board    64 × 46 enclosure, hinged door, brand mark on the front
     module   square, two screw circles on the bottom edge, side pins, an LED
     sensor   1:2.64 portrait, trapezoid gland cap, bands at 31.6% / 79.4%,
              two symmetric louvre stacks at the bottom
   Everything below is authored at scale 1 and placed with translate/scale so
   the same product reads identically in all three figures.
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Growcast sensor pod (12 × 33.9 at s = 1), cable gland on top. The face
 * carries the brand mark rather than a per-variable glyph: what the pod
 * measures is already said by the label beside it, and a thermometer or a CO₂
 * cloud at this size read as generic instrumentation instead of as a product.
 */
export function SensorNode({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cable gland cap */}
      <path className="fig-chassis" d="M4.2 0 H7.8 L9.8 2.2 H2.2 Z" />
      <rect className="fig-chassis" x="0" y="2.2" width="12" height="31.7" rx="0.9" />
      {/* seam bands at 31.6 % and 79.4 % of the body */}
      <path className="fig-pin" d="M0 12.2 H12 M0 27.4 H12" />
      <g className="fig-logo" transform={`translate(2.4 6) scale(${POD_MARK_S})`}>
        <path d={BRAND_MARK} />
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
export const SENSOR_PORT = (x: number, y: number, s = 1) => ({
  x: x + 6 * s,
  y,
})

export const BOARD_W = 64
export const BOARD_H = 46

/** Brand mark scale on the door: 86.56 × 83.22 → 24.2 × 23.3. */
const MARK_S = 0.28
/** and on a sensor pod face: 7.2 wide inside a 12-wide body. */
const POD_MARK_S = 7.2 / BRAND_MARK_VIEWBOX.w
/** the board is drawn big — it is the one piece of hardware in the frame */
export const BOARD_S = 1.4
const MARK_W = BRAND_MARK_VIEWBOX.w * MARK_S
const MARK_H = BRAND_MARK_VIEWBOX.h * MARK_S
/** Door interior runs x 9…61 (the hinge stile eats the first 9). */
const DOOR_CX = 35

/**
 * The Growcast control board: a wall-mounted electrical enclosure, 64 × 46 at
 * s = 1, hinged on the left, with the brand mark and wordmark on the front.
 * What a client is actually delivered is the panel — the bare DIN controller
 * the schematics used to draw was a part, not a product.
 */
export function ControlBoard({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cable glands straddling the bottom edge, under the shell */}
      {[16, 30, 44].map((gx) => (
        <g key={gx}>
          <rect className="fig-chassis" x={gx} y={BOARD_H - 4} width="10" height="7" rx="0.8" />
          <path className="fig-pin" d={`M${gx} ${BOARD_H - 1} H${gx + 10}`} />
        </g>
      ))}

      {/* enclosure shell, inset door, hinge stile */}
      <rect className="fig-chassis" x="0" y="0" width={BOARD_W} height={BOARD_H} rx="2" />
      <rect className="fig-pin" x="3" y="3" width={BOARD_W - 6} height={BOARD_H - 6} rx="1.2" fill="none" />
      <path className="fig-pin" d={`M9 3 V${BOARD_H - 3}`} />
      <g className="fig-chassis">
        <rect x="1.4" y="9" width="3.4" height="6" rx="0.8" />
        <rect x="1.4" y={BOARD_H - 15} width="3.4" height="6" rx="0.8" />
      </g>
      {/* quarter-turn latch on the lock stile */}
      <circle className="fig-pin" cx={BOARD_W - 7} cy={BOARD_H / 2} r="2.6" fill="none" />
      <path className="fig-pin" d={`M${BOARD_W - 9} ${BOARD_H / 2} H${BOARD_W - 5}`} />

      {/* the mark on the door, wordmark under it — this is the caption, so the
          stack needs no text label below the box */}
      <g className="fig-logo" transform={`translate(${DOOR_CX - MARK_W / 2} ${17 - MARK_H / 2}) scale(${MARK_S})`}>
        <path d={BRAND_MARK} />
      </g>
      <text x={DOOR_CX} y="34.5" textAnchor="middle" className="fig-wordmark">
        GROWCAST
      </text>

      {/* status LEDs, low on the hinge side — own <g> for the .fig-led stagger */}
      <g>
        <circle className="fig-led" cx="15" cy="38" r="1.4" />
        <circle className="fig-led" cx="20" cy="38" r="1.4" />
      </g>
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
export const PHONE_PORT = (x: number, y: number, s = 1) => ({
  x: x + (PHONE_W / 2) * s,
  y,
})

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

/**
 * Port coordinates of a <GrowcastBoard> placed at (x, y). Field wiring all
 * leaves the left edge, facing the room: the sense bus arrives high and the
 * commands leave below it. The uplink drops straight out of the bottom, so
 * board, arcs and phone all sit on ONE centre line — `BOARD_CX` is that line,
 * and the figures place the phone on it too.
 */
export const BOARD_CX = (BOARD_W * BOARD_S) / 2

export function boardPorts(x: number, y: number) {
  return {
    /** where the sense bus arrives */
    sensorIn: { x, y: y + 20 },
    /** where command i leaves for the room */
    cmdOut: (i: number) => ({ x, y: y + 34 + i * 12 }),
    /** bottom edge, centred — where the uplink leaves */
    uplinkOut: { x: x + BOARD_CX, y: y + 6 + BOARD_H * BOARD_S },
    /** origin of the uplink arcs, on the same centre line */
    uplink: { x: x + BOARD_CX, y: y + 96 },
  }
}

/** The product in the frame: one Growcast control board, drawn big. */
export function GrowcastBoard({ x, y }: { x: number; y: number }) {
  return <ControlBoard x={x} y={y + 6} s={BOARD_S} />
}
