import {
  CONTROLLABLE_TYPES,
  EXTRA_OUTPUT_KINDS,
  SENSOR_KINDS,
  isControllable,
  type ControllableType,
  type Design,
  type ExtraOutputKind,
  type SensorKind,
} from './schema'

/** Quote totals — always derived from items + extraOutputs, never trusted. */
export type Summary = {
  sensors: Record<SensorKind, number>
  totalSensors: number
  placedOutputs: Record<ControllableType, number>
  extraOutputs: Record<ExtraOutputKind, number>
  totalOutputs: number
  racks: number
  tables: number
  area: number
  volume: number
}

const zeros = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>

export function computeSummary(d: Design): Summary {
  const sensors = zeros(SENSOR_KINDS)
  const placedOutputs = zeros(CONTROLLABLE_TYPES)
  const extraOutputs = zeros(EXTRA_OUTPUT_KINDS)
  let racks = 0
  let tables = 0
  for (const it of d.items) {
    if (it.type === 'sensor' && it.sensorKind) sensors[it.sensorKind] += 1
    else if (isControllable(it.type)) placedOutputs[it.type] += it.outputs ?? 0
    else if (it.type === 'rack') racks += 1
    else if (it.type === 'table') tables += 1
  }
  for (const e of d.extraOutputs) extraOutputs[e.kind] += e.quantity
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)
  return {
    sensors,
    totalSensors: sum(sensors),
    placedOutputs,
    extraOutputs,
    totalOutputs: sum(placedOutputs) + sum(extraOutputs),
    racks,
    tables,
    area: d.room.width * d.room.length,
    volume: d.room.width * d.room.length * d.room.height,
  }
}

/** Convenience block written into exports (recomputed on import). */
export function summaryBlock(s: Summary) {
  const nonZero = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).filter(([, n]) => n > 0))
  return {
    sensorsByKind: nonZero(s.sensors),
    outputsByKind: { ...nonZero(s.placedOutputs), ...nonZero(s.extraOutputs) },
    totalSensors: s.totalSensors,
    totalOutputs: s.totalOutputs,
  }
}
