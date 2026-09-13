import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { Fan, GrowcastBoard, PHONE_PORT, PhoneCard, Pulse, SensorNode, UplinkArc, boardPorts } from './figures'

/**
 * Animated grow-room schematic: a gabled room (echoing the 3D warehouse)
 * with three hanging grow lights breathing over a bench of plants, a wall
 * fan spinning, a climate pod hanging mid-air and an EC/pH pod in the
 * nutrient tank. Their readings pulse to the Growcast control board on the
 * right, which commands lights, fan and irrigation; the uplink carries
 * everything to the phone below.
 *
 * The room lives inside a scaled group; the hardware, the pods and every
 * wire are authored in ROOT coordinates so they keep their true size at the
 * mobile render scale.
 */

// scene transform: translate(-4 10) scale(0.9) — helpers to land on it
const SX = (x: number) => -4 + 0.9 * x
const SY = (y: number) => 10 + 0.9 * y

const STACK_X = 238
const STACK_Y = 22
// the phone rides the board centre line: BOARD_CX (44.8) − half a phone (25.3)
const PHONE_X = 257.5
const PHONE_Y = 138
const PHONE_S = 1.15

const P = boardPorts(STACK_X, STACK_Y)
const PHONE = PHONE_PORT(PHONE_X, PHONE_Y, PHONE_S)

// sensor pods (root coords) and the bus that carries their readings
// the climate pod is ceiling-mounted in the gap between lamps 1 and 2; the
// sense bus leaves its gland cap and runs over the roof at y = 30
const CLIMATE = { x: 77, y: 54 }
const ECPH = { x: 28, y: 150 }

const SENSE_CLIMATE = `M${CLIMATE.x + 6} ${CLIMATE.y} V44 H126 V30 H200 V${P.sensorIn.y} H${P.sensorIn.x}`
const SENSE_ECPH = `M${ECPH.x + 6} ${ECPH.y} V144 H21 V30 H200 V${P.sensorIn.y} H${P.sensorIn.x}`

// commands leave the board, run down the gutter at x = 208 and into the room
const CMD_LIGHTS = `M${P.cmdOut(0).x} ${P.cmdOut(0).y} H208 V46 H${SX(124)} V${SY(82) + 0.2}`
const CMD_FAN = `M${P.cmdOut(1).x} ${P.cmdOut(1).y} H208 V${SY(108)} H${SX(213) + 8.1}`
const CMD_IRRIG = `M${P.cmdOut(2).x} ${P.cmdOut(2).y} H208 V${SY(191)} H${SX(214)}`
const UPLINK = `M${P.uplinkOut.x} ${P.uplinkOut.y} V${P.uplink.y}`

const PLANTS = [50, 82, 114, 146, 176]
const LAMPS = [
  [48, 88],
  [104, 144],
  [160, 200],
] as const

export default function GrowRoomFigure() {
  const intl = useIntl()
  return (
    <svg className="fig" viewBox="0 0 364 272" role="img" aria-label={intl.formatMessage(M.grAria)}>
      <g transform="translate(-4 10) scale(0.9)">
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

        {/* nutrient tank, pipe to the bench, irrigation pump */}
        <rect x="30" y="178" width="24" height="22" rx="1" className="fig-node" />
        <text x="42" y="212" textAnchor="middle" className="fig-lbl">
          {intl.formatMessage(M.grLblEcph)}
        </text>
        <path d="M54 190 H66 V156 H196" className="fig-wire" strokeDasharray="3 2" />
        <rect x="196" y="184" width="18" height="14" rx="1" className="fig-node" />
        <path d="M196 190 H66" className="fig-wire" opacity="0.4" />
        <text x="205" y="212" textAnchor="middle" className="fig-lbl">
          {intl.formatMessage(M.grLblIrrig)}
        </text>
      </g>

      {/* ── wiring, in root coordinates ── */}
      <path d={SENSE_CLIMATE} className="fig-wire" />
      <path d={SENSE_ECPH} className="fig-wire" />
      <path d={CMD_LIGHTS} className="fig-wire" />
      <path d={CMD_FAN} className="fig-wire" />
      <path d={CMD_IRRIG} className="fig-wire" />
      <path d={UPLINK} className="fig-wire" />
      <path d={`M${PHONE.x} ${P.uplink.y} V${PHONE.y}`} className="fig-link" />

      {/* climate pod hanging from the roof, EC/pH pod standing in the tank */}
      <SensorNode x={CLIMATE.x} y={CLIMATE.y} />
      <text x={CLIMATE.x + 6} y="40" textAnchor="middle" className="fig-lbl" fontSize="6.5">
        {intl.formatMessage(M.grLblSensor)}
      </text>
      <SensorNode x={ECPH.x} y={ECPH.y} />

      {/* the product: one Growcast control board */}
      <GrowcastBoard x={STACK_X} y={STACK_Y} />

      {/* live uplink to the phone */}
      <UplinkArc cx={P.uplink.x} cy={P.uplink.y} />
      <text x="302" y="121" className="fig-lbl fig-lbl-accent" fontSize="7">
        {intl.formatMessage(M.figLive)}
      </text>
      <PhoneCard x={PHONE_X} y={PHONE_Y} s={PHONE_S} metrics={['temp', 'hum']} />
      <text x={PHONE.x} y="249" textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.figPhone)}
      </text>
      <text x={PHONE.x} y="258" textAnchor="middle" className="fig-lbl fig-lbl-accent" fontSize="7">
        {intl.formatMessage(M.figApp)}
      </text>

      <text x="107" y="258" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.grLblRoom)}
      </text>

      {/* pulses */}
      <Pulse path={SENSE_CLIMATE} d="3.6s" delay="0s" />
      <Pulse path={SENSE_CLIMATE} d="3.6s" delay="-1.8s" />
      <Pulse path={SENSE_ECPH} d="5s" delay="-2.4s" />
      <Pulse path={CMD_LIGHTS} d="4s" delay="-1s" cmd />
      <Pulse path={CMD_FAN} d="2.6s" delay="-0.4s" cmd />
      <Pulse path={CMD_IRRIG} d="3.4s" delay="-2s" cmd />
      <Pulse path={UPLINK} d="2s" delay="-0.7s" />
    </svg>
  )
}
