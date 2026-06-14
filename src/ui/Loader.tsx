import { useEffect, useRef, useState } from 'react'

/**
 * Intro loading screen. Animates a copper progress bar over the GROWCAST mark
 * while the WebGL context spins up, holds at ~88% until `ready`, then fills to
 * 100% and fades out — handing off to the scene's start animation via onDone.
 */
export default function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [forced, setForced] = useState(false)
  const doneRef = useRef(false)
  const done = ready || forced

  // safety net: never trap the user behind the loader if WebGL is slow or the
  // context fails to report ready — dismiss after a hard cap
  useEffect(() => {
    const t = setTimeout(() => setForced(true), 6000)
    return () => clearTimeout(t)
  }, [])

  // advance the bar each frame: cruise to ~88% while loading, then to 100%
  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      if (!last) last = now
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setProgress((p) => {
        const target = done ? 100 : 88
        const speed = done ? 150 : 52 // percent per second
        return Math.min(target, p + speed * dt)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [done])

  // fully loaded → trigger the reveal, then unmount after the fade
  useEffect(() => {
    if (progress < 100 || !done || doneRef.current) return
    doneRef.current = true
    onDone()
    const t = setTimeout(() => setHidden(true), 750)
    return () => clearTimeout(t)
  }, [progress, done, onDone])

  if (hidden) return null

  return (
    <div className={`loader${doneRef.current ? ' is-done' : ''}`} role="status" aria-live="polite">
      <div className="loader-inner">
        <span className="loader-mark" aria-hidden />
        <span className="loader-word">
          GROWCAST<span className="loader-sub">AGRO</span>
        </span>
        <div className="loader-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <span className="loader-pct">{String(Math.round(progress)).padStart(2, '0')}%</span>
      </div>
    </div>
  )
}
