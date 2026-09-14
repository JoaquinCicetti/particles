import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { Fan, GrowcastBoard, PHONE_PORT, PhoneCard, Pulse, SensorNode, UplinkArc, boardPorts } from './figures'

/**
 * Animated silo schematic: two thermometry cables hang inside the grain
 * mass, a CO₂ pod sits on the roof vent, and their readings pulse up to the
 * Growcast control board to the right, which commands the aeration fan; the
 * uplink carries everything to the phone below. A hot spot on the left cable
 * throbs on the right cable.
 *
 * The silo lives inside <g transform="translate(4 10)">. CSS offset-path
 * resolves in the ELEMENT'S OWN coordinate system, so every <Pulse> below
 * lives at root level with root-coordinate path data — never inside that
 * group.
 */

// pulse paths, in ROOT coordinates (= local + 4, + 10)
const CABLE_L = 'M78 200 V59 L102 44 V6 H200 V42 H238'
const CABLE_R = 'M126 200 V59 L102 44 V6 H200 V42 H238'
/** the leg the cables share above the roof — the only part not already drawn in-group */
const TRUNK = 'M102 44 V6 H200 V42 H238'
// the fan command drops down a gutter at x = 226, clear of the hot-spot callout
const TO_FAN = 'M238 56 H226 V222 H185'
const UPLINK = 'M282.8 92.4 V118'

const STACK_X = 238
const STACK_Y = 22
// the phone rides the board centre line: BOARD_CX (44.8) − half a phone (25.3)
const PHONE_X = 257.5
const PHONE_Y = 138
const PHONE_S = 1.15

const P = boardPorts(STACK_X, STACK_Y)
const PHONE = PHONE_PORT(PHONE_X, PHONE_Y, PHONE_S)

const CO2 = { x: 96, y: 6 }

const NODES_Y = [80, 104, 128, 152, 176]
const GRAIN_TOP_AT = (x: number) => (x < 98 ? 132 - ((x - 46) / 52) * 20 : 112 + ((x - 98) / 52) * 20)

export default function SiloFigure() {
  const intl = useIntl()

  return (
    <svg className="fig" viewBox="0 0 364 272" role="img" aria-label={intl.formatMessage(M.siloAria)}>
      <defs>
        <pattern id="silo-grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.75" fill="currentColor" opacity="0.45" />
        </pattern>
      </defs>
      <g transform="translate(4 10)">
        {/* grain mass */}
        <path d="M46 132 L98 112 L150 132 V200 H46 Z" fill="currentColor" opacity="0.1" />
        <path d="M46 132 L98 112 L150 132 V200 H46 Z" fill="url(#silo-grain)" />

        {/* silo body, roof, hopper, legs */}
        <g className="fig-rings">
          {[84, 98, 112, 126, 140, 154, 168, 182].map((y) => (
            <line key={y} x1="46" y1={y} x2="150" y2={y} />
          ))}
        </g>
        <g className="fig-struct">
          <rect x="46" y="70" width="104" height="130" />
          <path d="M40 70 L98 34 L156 70" />
          <path d="M46 200 L84 226 H112 L150 200" />
          <path d="M54 200 V232 M142 200 V232 M36 232 H160" />
          <path d="M96 30 V34 M100 30 V34" />
        </g>

        {/* thermometry cables + sensor nodes (cable-mounted thermocouples) */}
        <path d="M74 49 V190 M122 49 V190" className="fig-cable" />
        <path d="M74 49 L98 34 L122 49" className="fig-wire" />
        {[74, 122].map((x) =>
          NODES_Y.map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" className={`fig-node${y > GRAIN_TOP_AT(x) ? ' in-grain' : ''}`} />
          )),
        )}
        {/* hot spot on the right cable — the callout needs the clear band
            between the silo wall and the sense bus, and the left margin has
            none once the figure is drawn at full width */}
        <circle cx="122" cy="152" r="3" className="fig-hot" />
        <circle cx="122" cy="152" r="3" className="fig-hot late" />
        <path d="M126 152 H162" className="fig-wire" strokeDasharray="2 2" />
        <text x="166" y="149" className="fig-lbl fig-lbl-accent">
          {intl.formatMessage(M.siloLblHot)}
        </text>
        <text x="166" y="159" className="fig-lbl">
          24.1 °C
        </text>

        {/* aeration fan */}
        <Fan cx={170} cy={212} r={11} />
        {/* above the fan: below it the caption ran into the silo's legs and ground line */}
        <text x="178" y="195" textAnchor="middle" className="fig-lbl">
          {intl.formatMessage(M.siloLblFan)}
        </text>
      </g>

      {/* ── wiring, in root coordinates ── */}
      <path d={TRUNK} className="fig-wire" />
      <path d={TO_FAN} className="fig-wire" />
      <path d={UPLINK} className="fig-wire" />
      <path d={`M${PHONE.x} ${P.uplink.y} V${PHONE.y}`} className="fig-link" />

      {/* headspace CO₂ pod, mounted on the roof vent */}
      <SensorNode x={CO2.x} y={CO2.y} />
      <text x="92" y="24" textAnchor="end" className="fig-lbl" fontSize="7">
        CO₂
      </text>

      {/* the product: one Growcast control board */}
      <GrowcastBoard x={STACK_X} y={STACK_Y} />

      {/* live uplink to the phone */}
      <UplinkArc cx={P.uplink.x} cy={P.uplink.y} />
      <text x="302" y="121" className="fig-lbl fig-lbl-accent" fontSize="7">
        {intl.formatMessage(M.figLive)}
      </text>
      <PhoneCard x={PHONE_X} y={PHONE_Y} s={PHONE_S} metrics={['temp', 'co2']} />
      <text x={PHONE.x} y="249" textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.figPhone)}
      </text>
      <text x={PHONE.x} y="258" textAnchor="middle" className="fig-lbl fig-lbl-accent" fontSize="7">
        {intl.formatMessage(M.figApp)}
      </text>

      {/* probes label under the silo */}
      <text x="102" y="258" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.siloLblProbes)}
      </text>

      {/* travelling readings + command pulse — root level, root path data */}
      <Pulse path={CABLE_L} d="4.2s" delay="0s" />
      <Pulse path={CABLE_L} d="4.2s" delay="-2.1s" />
      <Pulse path={CABLE_R} d="4.6s" delay="-1s" />
      <Pulse path={CABLE_R} d="4.6s" delay="-3.3s" />
      <Pulse path={TO_FAN} d="3.2s" delay="-1.2s" cmd />
      <Pulse path={UPLINK} d="2s" delay="-0.4s" />
    </svg>
  )
}
