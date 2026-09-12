import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { Box, Fan, GrowcastStack, PHONE_PORT, PhoneCard, Pulse, SensorNode, UplinkArc, stackPorts } from './figures'

/**
 * Animated curing-room schematic: a tall rack with wheels of cheese on four
 * shelves, two Growcast pods (climate and CO₂) on the centre post, one wheel
 * resting on a scale. The chamber's cooling unit hangs from the ceiling and
 * the humidifier stands on the floor, both commanded by control modules on
 * the rail to the right; the uplink carries everything to the phone below.
 *
 * The rack lives inside <g transform="translate(-6 -8)">; the hardware, the
 * pods and every wire are authored in ROOT coordinates so they keep their
 * true size at the mobile render scale.
 */

const READ_1 = 'M104 73 V36 H200 V42 H214'
const READ_2 = 'M104 113 V36 H200 V42 H214'
const CMD_COLD = 'M312 30.75 H208 V18.5 H140'
const CMD_HUM = 'M312 52.75 H208 V223.5 H98'
const UPLINK = 'M278 50 H284 V118 H320'

const STACK_X = 214
const STACK_Y = 22
const PHONE_X = 294
const PHONE_Y = 138
const PHONE_S = 1.15

const P = stackPorts(STACK_X, STACK_Y)
const PHONE = PHONE_PORT(PHONE_X, PHONE_Y, PHONE_S)

const CLIMATE = { x: 98, y: 73 }
const CO2 = { x: 98, y: 113 }

const SHELVES = [78, 118, 158, 198]
const WHEELS = [50, 90, 130, 170]

export default function CuringRoomFigure() {
  const intl = useIntl()
  return (
    <svg className="fig" viewBox="0 0 364 272" role="img" aria-label={intl.formatMessage(M.crAria)}>
      <g transform="translate(-6 -8)">
        {/* rack: posts, top rail, shelves */}
        <g className="fig-struct">
          <path d="M30 214 V36 H190 V214" />
          <path d="M110 36 V214" />
          {SHELVES.map((y) => (
            <path key={y} d={`M30 ${y} H190`} />
          ))}
        </g>
        <g className="fig-rings">
          {SHELVES.map((y) => (
            <path key={y} d={`M30 ${y + 3} H190`} />
          ))}
        </g>

        {/* wheels of cheese */}
        {SHELVES.map((y) =>
          WHEELS.map((x) => (
            <g key={`${x}-${y}`}>
              <rect x={x - 16} y={y - 16} width="32" height="14" rx="4" className="fig-cheese" />
              <path d={`M${x - 11} ${y - 9} H${x + 11}`} stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
            </g>
          )),
        )}

        {/* scale under the last wheel of the bottom shelf */}
        <rect x="150" y="196" width="40" height="4" rx="1" fill="currentColor" opacity="0.9" />
        <text x="170" y="210" textAnchor="middle" className="fig-lbl fig-lbl-accent" fontSize="7.5">
          {intl.formatMessage(M.crLblScale)} · −7.8 %
        </text>
      </g>

      {/* ── chamber shell: ceiling above the rack, floor below it. The rack's
             feet reach down to the floor the humidifier stands on. ── */}
      <g className="fig-struct">
        <path d="M14 9 H200" />
        <path d="M14 234 H200" />
        <path d="M24 206 V234 M184 206 V234" />
      </g>

      {/* ceiling-mounted cooling unit — caption goes ABOVE it, the frame edge
          leaves no room beside it */}
      <text x="108" y="6" textAnchor="middle" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.crLblCold)}
      </text>
      <path d="M90 9 V12 M126 9 V12" className="fig-wire" />
      <rect x="76" y="12" width="64" height="13" rx="1.5" className="fig-node" />
      <path d="M84 14 V23 M132 14 V23" className="fig-pin" />
      <Fan cx={108} cy={18.5} r={5.5} />

      {/* ── wiring, in root coordinates ── */}
      <path d={READ_1} className="fig-wire" />
      <path d={READ_2} className="fig-wire" />
      <path d={CMD_COLD} className="fig-wire" />
      <path d={CMD_HUM} className="fig-wire" />
      <path d={UPLINK} className="fig-wire" />
      <path d={`M${PHONE.x} ${P.uplink.y} V${PHONE.y}`} className="fig-link" />

      {/* floor-standing humidifier with rising mist */}
      <Box x={40} y={213} w={58} h={21} label={intl.formatMessage(M.crLblHum)}>
        <path d="M46 224 h46" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <path d="M50 229 h38" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        {[50, 60, 70, 80, 90].map((x, i) => (
          <circle key={x} cx={x} cy="213" r="1.6" className="fig-mist" style={{ ['--delay' as string]: `${i * 0.5}s` }} />
        ))}
      </Box>

      {/* climate + CO₂ pods on the centre post */}
      <SensorNode x={CLIMATE.x} y={CLIMATE.y} kind="hum" />
      <text x="94" y="90" textAnchor="end" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.crLblSensor)}
      </text>
      <SensorNode x={CO2.x} y={CO2.y} kind="co2" />
      <text x="94" y="130" textAnchor="end" className="fig-lbl" fontSize="7">
        {intl.formatMessage(M.crLblCo2)}
      </text>

      {/* the product: device + expander + two control modules on a DIN rail */}
      <GrowcastStack x={STACK_X} y={STACK_Y} modules={2} />

      {/* live uplink to the phone */}
      <UplinkArc cx={P.uplink.x} cy={P.uplink.y} />
      <text x="300" y="130" textAnchor="end" className="fig-lbl fig-lbl-accent" fontSize="7">
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
        {intl.formatMessage(M.crLblRack)}
      </text>

      {/* pulses */}
      <Pulse path={READ_1} d="4s" delay="0s" />
      <Pulse path={READ_2} d="4.4s" delay="-2.2s" />
      <Pulse path={CMD_COLD} d="3s" delay="-0.6s" cmd />
      <Pulse path={CMD_HUM} d="3.6s" delay="-1.6s" cmd />
      <Pulse path={UPLINK} d="2s" delay="-0.3s" />
    </svg>
  )
}
