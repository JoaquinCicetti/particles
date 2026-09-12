/* eslint-disable react-refresh/only-export-components --
   SENSOR_PATHS is shared with figures.tsx so the schematics reuse these six
   glyphs instead of duplicating them; the cost is HMR for this one file. */

/** Tiny line icons for the sensor variables (16×16, stroke = currentColor). */
export const SENSOR_PATHS: Record<string, string> = {
  temp: 'M8 2.5a2 2 0 0 1 2 2v5.2a3.2 3.2 0 1 1-4 0V4.5a2 2 0 0 1 2-2zM8 7v4',
  hum: 'M8 2.5c2.6 3.2 4 5.3 4 7.2a4 4 0 0 1-8 0c0-1.9 1.4-4 4-7.2z',
  co2: 'M5 12.5h6.5a2.8 2.8 0 0 0 .3-5.6A4 4 0 0 0 4.2 8 2.3 2.3 0 0 0 5 12.5z',
  ec: 'M9 2 4.5 9h3.2L7 14l4.5-7H8.3L9 2z',
  ph: 'M6.5 2.5h3M7 2.5v4L4 12.2A1.2 1.2 0 0 0 5 14h6a1.2 1.2 0 0 0 1-1.8L9 6.5v-4',
  air: 'M2.5 6h7a2 2 0 1 0-2-2M2.5 9.5h9.5a2 2 0 1 1-2 2M2.5 12.5h5',
}

export type SensorIconKey = keyof typeof SENSOR_PATHS

export default function SensorIcon({ name }: { name: SensorIconKey }) {
  return (
    <svg className="sensor-icon" viewBox="0 0 16 16" aria-hidden>
      <path d={SENSOR_PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
