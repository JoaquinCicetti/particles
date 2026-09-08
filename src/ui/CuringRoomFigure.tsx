import { useIntl } from 'react-intl'
import { M } from '../i18n/messages'
import { Box, CoreMark, Fan, Pulse } from './figures'

/**
 * Animated curing-room schematic: a tall rack with wheels of cheese on four
 * shelves, a climate sensor and a CO₂ sensor on the centre post, one wheel
 * resting on a scale, and the chamber's cooling unit (spinning) and
 * humidifier (rising mist) commanded by the node, which reports to Growcast.
 */

const READ_1 = 'M110 92 V28 H326 V100'
const READ_2 = 'M110 166 V28 H326 V100'
const CMD_COLD = 'M306 111 H298 V57 H292'
const CMD_HUM = 'M306 111 H298 V117 H292'
const TO_CORE = 'M326 122 V160'

const SHELVES = [78, 118, 158, 198]
const WHEELS = [50, 90, 130, 170]

export default function CuringRoomFigure() {
  const intl = useIntl()
  return (
    <svg className="fig" viewBox="0 0 364 246" role="img" aria-label={intl.formatMessage(M.crAria)}>
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
      <text x="170" y="224" textAnchor="middle" className="fig-lbl fig-lbl-accent" fontSize="7.5">
        {intl.formatMessage(M.crLblScale)} · −7.8 %
      </text>

      {/* sensors on the centre post */}
      <rect x="104" y="92" width="12" height="8" rx="1" className="fig-node" />
      <text x="110" y="89" textAnchor="middle" className="fig-lbl" fontSize="7.5">
        {intl.formatMessage(M.crLblSensor)}
      </text>
      <rect x="104" y="166" width="12" height="8" rx="1" className="fig-node" />
      <text x="110" y="164" textAnchor="middle" className="fig-lbl" fontSize="7.5">
        {intl.formatMessage(M.crLblCo2)}
      </text>

      {/* wires */}
      <path d={READ_1} className="fig-wire" />
      <path d="M110 166 V100" className="fig-wire" />
      <path d={CMD_COLD} className="fig-wire" />
      <path d={CMD_HUM} className="fig-wire" />
      <path d={TO_CORE} className="fig-wire" />

      {/* cooling unit */}
      <Box x={232} y={44} w={60} h={26} label={intl.formatMessage(M.crLblCold)}>
        <Fan cx={262} cy={57} r={9} />
        <path d="M240 50 v14 M284 50 v14" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </Box>

      {/* humidifier with rising mist */}
      <Box x={232} y={104} w={60} h={26} label={intl.formatMessage(M.crLblHum)}>
        <path d="M240 117 h44" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <path d="M244 123 h36" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        {[248, 256, 264, 272, 280].map((x, i) => (
          <circle key={x} cx={x} cy="104" r="1.6" className="fig-mist" style={{ ['--delay' as string]: `${i * 0.5}s` }} />
        ))}
      </Box>

      {/* node + core */}
      <Box x={306} y={100} w={40} h={22} label={intl.formatMessage(M.siloLblNode)}>
        <rect x="314" y="107" width="24" height="8" rx="1" fill="currentColor" opacity="0.75" />
      </Box>
      <Box x={306} y={160} w={40} h={24} label={intl.formatMessage(M.siloLblCore)} accent>
        <CoreMark cx={326} cy={172} />
      </Box>

      <text x="110" y="240" textAnchor="middle" className="fig-lbl">
        {intl.formatMessage(M.crLblRack)}
      </text>

      {/* pulses */}
      <Pulse path={READ_1} d="4s" delay="0s" />
      <Pulse path={READ_2} d="4.4s" delay="-2.2s" />
      <Pulse path={CMD_COLD} d="2.4s" delay="-0.6s" cmd />
      <Pulse path={CMD_HUM} d="2.8s" delay="-1.6s" cmd />
      <Pulse path={TO_CORE} d="1.6s" delay="-0.3s" />
    </svg>
  )
}
