import {
  CONTROLLABLE_TYPES,
  EXTRA_OUTPUT_KINDS,
  SENSOR_KINDS,
  STRUCTURE_TYPES,
  isControllable,
  isStructure,
  type ControllableType,
  type Design,
  type ExtraOutputKind,
  type SensorKind,
  type StructureType,
} from './schema'

/** Quote totals — always derived from items + extraOutputs, never trusted. */
export type Summary = {
  sensors: Record<SensorKind, number>
  totalSensors: number
  placedOutputs: Record<ControllableType, number>
  extraOutputs: Record<ExtraOutputKind, number>
  totalOutputs: number
  structures: Record<StructureType, number>
  area: number
  volume: number
}

const zeros = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>

export function computeSummary(d: Design): Summary {
  const sensors = zeros(SENSOR_KINDS)
  const placedOutputs = zeros(CONTROLLABLE_TYPES)
  const extraOutputs = zeros(EXTRA_OUTPUT_KINDS)
  const structures = zeros(STRUCTURE_TYPES)
  for (const it of d.items) {
    if (it.type === 'sensor' && it.sensorKind) sensors[it.sensorKind] += 1
    else if (isControllable(it.type)) placedOutputs[it.type] += it.outputs ?? 0
    else if (isStructure(it.type)) structures[it.type] += 1
  }
  for (const e of d.extraOutputs) extraOutputs[e.kind] += e.quantity
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)
  const area = d.room.shape === 'round' ? Math.PI * (d.room.width / 2) ** 2 : d.room.width * d.room.length
  return {
    sensors,
    totalSensors: sum(sensors),
    placedOutputs,
    extraOutputs,
    totalOutputs: sum(placedOutputs) + sum(extraOutputs),
    structures,
    area,
    volume: area * d.room.height,
  }
}

/** Convenience block written into exports (recomputed on import). */
export function summaryBlock(s: Summary) {
  const nonZero = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).filter(([, n]) => n > 0))
  return {
    structuresByKind: nonZero(s.structures),
    sensorsByKind: nonZero(s.sensors),
    outputsByKind: { ...nonZero(s.placedOutputs), ...nonZero(s.extraOutputs) },
    totalSensors: s.totalSensors,
    totalOutputs: s.totalOutputs,
  }
}
