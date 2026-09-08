import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { Box, CoreMark, Fan, Pulse } from './figures'

/**
 * Animated grow-room schematic: a gabled room (echoing the 3D warehouse)
 * with three hanging grow lights breathing over a bench of plants, a wall
 * fan spinning, a climate sensor hanging mid-air, an EC/pH tank and an
 * irrigation pump. Readings pulse to the controller; commands pulse back to
 * lights, fan and irrigation; the controller reports to Growcast.
 */

const READ = 'M150 96 V30 H295 V60'
const CMD_LIGHTS = 'M270 66 H248 V34 H124 V40'
const CMD_FAN = 'M270 73 H244 V108 H222'
const CMD_IRRIG = 'M270 80 H236 V191 H214'
const TO_CORE = 'M295 86 V150'

const PLANTS = [50, 82, 114, 146, 176]
const LAMPS = [
  [48, 88],
  [104, 144],
  [160, 200],
] as const

export default function GrowRoomFigure() {
  const intl = useIntl()
  return (
    <svg className="fig" viewBox="0 0 364 246" role="img" aria-label={intl.formatMessage(M.grAria)}>
      {/* room: walls + gable roof + floor */}
      <g className="fig-struct">
        <path d="M24 200 V70 L124 40 L224 70 V200 Z" />
        <path d="M16 200 H232" />
      </g>
      <g className="fig-rings">
        <path d="M24 100 H224 M24 130 H224 M24 160 H224" />
      </g>

      {/* light cones (behind everything else in the room) */}
      {LAMPS.map(([a, b], i) => (
        <polygon
          key={a}
          className="fig-cone"
          points={`${a},87 ${b},87 ${b + 16},150 ${a - 16},150`}
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}

      {/* lamps + cords to the roof */}
      {LAMPS.map(([a, b]) => {
        const cx = (a + b) / 2
        const roofY = 70 - (1 - Math.abs(cx - 124) / 100) * 30
        return (
          <g key={a}>
            <line x1={cx} y1={roofY} x2={cx} y2="82" className="fig-wire" />
            <rect x={a} y="82" width={b - a} height="5" rx="1" className="fig-lamp" />
          </g>
        )
      })}
      <text x="124" y="97" textAnchor="middle" className="fig-lbl fig-lbl-accent">
        {intl.formatMessage(M.grLblLights)}
      </text>

      {/* bench + pots + plants */}
      <g className="fig-struct">
        <path d="M34 152 H214 M40 152 V200 M208 152 V200" />
      </g>
      {PLANTS.map((x) => (
        <g key={x}>
          <path d={`M${x - 6} 140 H${x + 6} L${x + 4} 152 H${x - 4} Z`} className="fig-node" />
          <g className="fig-plant">
            <path d={`M${x} 140 V118`} />
            <path d={`M${x} 132 q-9 -3 -11 -11 q9 2 11 11`} />
            <path d={`M${x} 132 q9 -3 11 -11 q-9 2 -11 11`} />
            <path d={`M${x} 124 q-7 -2 -8 -9 q7 1 8 9`} />
            <path d={`M${x} 124 q7 -2 8 -9 q-7 1 -8 9`} />
          </g>
        </g>
      ))}

      {/* wall fan */}
      <Fan cx={213} cy={108} r={9} />
      <text x="213" y="130" textAnchor="middle" className="fig-lbl" fontSize="7.5">
        {intl.formatMessage(M.grLblFan)}
      </text>

      {/* climate sensor hanging mid-air */}
      <line x1="150" y1="49" x2="150" y2="96" className="fig-wire" />
      <rect x="144" y="96" width="12" height="8" rx="1" className="fig-node" />
      <text x="150" y="113" textAnchor="middle" className="fig-lbl" fontSize="7.5">
        {intl.formatMessage(M.grLblSensor)}
      </text>

      {/* nutrient tank with EC/pH probe, pipe to the bench, irrigation pump */}
      <rect x="30" y="178" width="24" height="22" rx="1" className="fig-node" />
      <path d="M34 186 H50" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="46" y1="170" x2="46" y2="192" className="fig-cable" />
      <text x="42" y="212" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.grLblEcph)}
      </text>
      <path d="M54 190 H66 V156 H196" className="fig-wire" strokeDasharray="3 2" />
      <rect x="196" y="184" width="18" height="14" rx="1" className="fig-node" />
      <path d="M196 190 H66" className="fig-wire" opacity="0.4" />
      <text x="205" y="212" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.grLblIrrig)}
      </text>

      {/* wires */}
      <path d={READ} className="fig-wire" />
      <path d={CMD_LIGHTS} className="fig-wire" />
      <path d={CMD_FAN} className="fig-wire" />
      <path d={CMD_IRRIG} className="fig-wire" />
      <path d={TO_CORE} className="fig-wire" />

      {/* controller with blinking LEDs, Growcast core */}
      <Box x={270} y={60} w={50} h={26} label={intl.formatMessage(M.grLblControl)}>
        <g>
          <circle cx="284" cy="73" r="2" className="fig-led" />
          <circle cx="295" cy="73" r="2" className="fig-led" />
          <circle cx="306" cy="73" r="2" className="fig-led" />
        </g>
      </Box>
      <Box x={270} y={150} w={50} h={26} label={intl.formatMessage(M.siloLblCore)} accent>
        <CoreMark cx={295} cy={163} />
      </Box>

      <text x="124" y="236" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.grLblRoom)}
      </text>

      {/* pulses */}
      <Pulse path={READ} d="3.6s" delay="0s" />
      <Pulse path={READ} d="3.6s" delay="-1.8s" />
      <Pulse path={CMD_LIGHTS} d="4s" delay="-1s" cmd />
      <Pulse path={CMD_FAN} d="2.6s" delay="-0.4s" cmd />
      <Pulse path={CMD_IRRIG} d="3.4s" delay="-2s" cmd />
      <Pulse path={TO_CORE} d="1.6s" delay="-0.7s" />
    </svg>
  )
}
