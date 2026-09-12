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
  // vapour-pressure deficit: a droplet next to the delta it is short of
  vpd: 'M5.4 2.4c1.7 2.1 2.6 3.5 2.6 4.7a2.6 2.6 0 0 1-5.2 0c0-1.2.9-2.6 2.6-4.7zM11.4 7.4l3.1 5.6h-6.2z',
  // water content: a droplet held in the soil bands beneath it
  wc: 'M8 1.6c1.9 2.4 2.9 3.9 2.9 5.2a2.9 2.9 0 0 1-5.8 0c0-1.3 1-2.8 2.9-5.2zM2.4 11.2h11.2M4.2 13.8h7.6',
}

export type SensorIconKey = keyof typeof SENSOR_PATHS

export default function SensorIcon({ name }: { name: SensorIconKey }) {
  return (
    <svg className="sensor-icon" viewBox="0 0 16 16" aria-hidden>
      <path d={SENSOR_PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
