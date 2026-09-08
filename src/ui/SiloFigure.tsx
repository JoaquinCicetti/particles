import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'

/**
 * Animated silo schematic for the silos section: two thermometry cables hang
 * inside the grain mass, their readings pulse up to the node box, on to the
 * Growcast core, and a command pulse comes back down to the aeration fan.
 * A hot spot on the left cable throbs. Pure SVG + CSS (offset-path).
 */

// wires the pulses travel along (viewBox units, inside the translated group)
const CABLE_L = 'M74 190 V49 L98 34 V22 H200 V52'
const CABLE_R = 'M122 190 V49 L98 34 V22 H200 V52'
const TO_CORE = 'M214 63 H268'
const TO_FAN = 'M200 74 V212 H182'

const NODES_Y = [80, 104, 128, 152, 176]
const GRAIN_TOP_AT = (x: number) => (x < 98 ? 132 - ((x - 46) / 52) * 20 : 112 + ((x - 98) / 52) * 20)

export default function SiloFigure() {
  const intl = useIntl()
  const pulse = (path: string, d: string, delay: string, cmd = false) => (
    <circle
      key={`${path}-${delay}`}
      className={`silo-pulse${cmd ? ' cmd' : ''}`}
      r="2.2"
      style={{ offsetPath: `path('${path}')`, ['--d' as string]: d, ['--delay' as string]: delay }}
    />
  )

  return (
    <svg className="silo" viewBox="0 0 364 246" role="img" aria-label={intl.formatMessage(M.siloAria)}>
      <defs>
        <pattern id="silo-grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.75" fill="currentColor" opacity="0.45" />
        </pattern>
      </defs>
      <g transform="translate(24 0)">
        {/* grain mass */}
        <path d="M46 132 L98 112 L150 132 V200 H46 Z" fill="currentColor" opacity="0.1" />
        <path d="M46 132 L98 112 L150 132 V200 H46 Z" fill="url(#silo-grain)" />

        {/* silo body, roof, hopper, legs */}
        <g className="silo-rings">
          {[84, 98, 112, 126, 140, 154, 168, 182].map((y) => (
            <line key={y} x1="46" y1={y} x2="150" y2={y} />
          ))}
        </g>
        <g className="silo-struct">
          <rect x="46" y="70" width="104" height="130" />
          <path d="M40 70 L98 34 L156 70" />
          <path d="M46 200 L84 226 H112 L150 200" />
          <path d="M54 200 V232 M142 200 V232 M36 232 H160" />
          <path d="M96 30 V34 M100 30 V34" />
        </g>

        {/* headspace CO₂ sensor */}
        <rect x="88" y="44" width="20" height="9" rx="1" className="silo-node" />
        <text x="98" y="51" textAnchor="middle" className="silo-lbl" fontSize="6.2">
          CO₂
        </text>

        {/* thermometry cables + sensor nodes */}
        <path d="M74 49 V190 M122 49 V190" className="silo-cable" />
        <path d="M74 49 L98 34 L122 49" className="silo-wire" />
        {[74, 122].map((x) =>
          NODES_Y.map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" className={`silo-node${y > GRAIN_TOP_AT(x) ? ' in-grain' : ''}`} />
          )),
        )}
        {/* hot spot on the left cable */}
        <circle cx="74" cy="152" r="3" className="silo-hot" />
        <circle cx="74" cy="152" r="3" className="silo-hot late" />
        <path d="M70 152 H40" className="silo-wire" strokeDasharray="2 2" />
        <text x="36" y="148" textAnchor="end" className="silo-lbl silo-lbl-accent">
          {intl.formatMessage(M.siloLblHot)}
        </text>
        <text x="36" y="157" textAnchor="end" className="silo-lbl">
          24.1 °C
        </text>

        {/* roof → node → core, node → fan */}
        <path d="M98 34 V22 H200 V52" className="silo-wire" />
        <path d={TO_CORE} className="silo-wire" />
        <path d={TO_FAN} className="silo-wire" />

        {/* node box */}
        <rect x="186" y="52" width="28" height="22" rx="2" className="silo-node" />
        <rect x="192" y="59" width="16" height="8" rx="1" fill="currentColor" opacity="0.75" />
        <text x="200" y="86" textAnchor="middle" className="silo-lbl">
          {intl.formatMessage(M.siloLblNode)}
        </text>

        {/* growcast core */}
        <rect x="268" y="50" width="48" height="26" rx="2" className="silo-node" />
        <path d="M280 63 h24 M292 55 v16" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        <circle cx="292" cy="63" r="3" fill="currentColor" />
        <text x="292" y="88" textAnchor="middle" className="silo-lbl silo-lbl-accent">
          {intl.formatMessage(M.siloLblCore)}
        </text>

        {/* aeration fan */}
        <circle cx="170" cy="212" r="11" className="silo-node" />
        <g className="silo-fan-blades" fill="currentColor" opacity="0.9">
          <path d="M170 212 L170 203 Q176 206 172 212 Z" />
          <path d="M170 212 L178 217 Q173 220 170 216 Z" />
          <path d="M170 212 L162 217 Q162 210 168 210 Z" />
        </g>
        <circle cx="170" cy="212" r="1.6" fill="currentColor" />
        <text x="170" y="234" textAnchor="middle" className="silo-lbl">
          {intl.formatMessage(M.siloLblFan)}
        </text>

        {/* probes label under the silo */}
        <text x="98" y="243" textAnchor="middle" className="silo-lbl">
          {intl.formatMessage(M.siloLblProbes)}
        </text>

        {/* travelling readings + command pulse */}
        {pulse(CABLE_L, '4.2s', '0s')}
        {pulse(CABLE_L, '4.2s', '-2.1s')}
        {pulse(CABLE_R, '4.6s', '-1s')}
        {pulse(CABLE_R, '4.6s', '-3.3s')}
        {pulse(TO_CORE, '1.6s', '-0.4s')}
        {pulse(TO_FAN, '3.2s', '-1.2s', true)}
      </g>
    </svg>
  )
}
