import { useEffect, useState } from 'react'
import {
  CAMERA_MODES,
  CAMERA_MODE_EVENT,
  getCameraModeIndex,
  setCameraMode,
} from '../scene/cameraModes'

/**
 * TEMPORARY — camera ROUTE A/B switch. The four candidates differ only in the
 * approach: the run from the opening shot to the enclosure door. Opening,
 * door shot, sky turn and the whole tail are identical in all of them.
 * Delete this file, its <CameraSwitch/> mount in App.tsx, the .cam-switch block
 * in global.css, and src/scene/cameraModes.ts once a route is chosen.
 *
 * Sits under the header CTA rather than beside it, because the top-right corner
 * is already taken by "BOOK A MEETING". The choice persists in localStorage so
 * a reload keeps whichever route you were judging.
 */
export default function CameraSwitch() {
  const [mode, setMode] = useState(getCameraModeIndex)

  // another surface (or a reload in a second tab) can change it too
  useEffect(() => {
    const sync = () => setMode(getCameraModeIndex())
    window.addEventListener(CAMERA_MODE_EVENT, sync)
    return () => window.removeEventListener(CAMERA_MODE_EVENT, sync)
  }, [])

  // 1..4 switch modes from the keyboard, so you can judge without reaching for
  // the mouse mid-scroll — ignored while typing or holding a modifier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, select, [contenteditable]')) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= CAMERA_MODES.length) {
        setCameraMode(n - 1)
        setMode(n - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="cam-switch" role="group" aria-label="Camera route (testing)">
      <span className="cam-switch-kicker">APPROACH · TEST</span>
      {CAMERA_MODES.map((m, i) => (
        <button
          key={m.id}
          type="button"
          className={`cam-switch-btn${i === mode ? ' is-active' : ''}`}
          aria-pressed={i === mode}
          title={m.hint}
          onClick={() => {
            setCameraMode(i)
            setMode(i)
          }}
        >
          {m.label}
        </button>
      ))}
      <span className="cam-switch-hint">{CAMERA_MODES[mode]?.hint}</span>
    </div>
  )
}
