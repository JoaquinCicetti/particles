import { useEffect, useRef, useState } from 'react'

/** safety net only: if WebGL never reports ready, don't trap the user */
const MAX_SHOW_MS = 6000

/**
 * Intro loading screen: the flipping Growcast logo, shown only for as long as
 * the WebGL context takes to spin up. The moment it is `ready` the loader
 * fades out, handing off to the scene's start animation via onDone, and
 * unmounts when the fade transition ends.
 */
export default function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [forced, setForced] = useState(false)
  const [hidden, setHidden] = useState(false)
  const handedOff = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setForced(true), MAX_SHOW_MS)
    return () => clearTimeout(t)
  }, [])

  // both inputs only ever flip to true, so once done the loader stays done
  const done = ready || forced

  // hand off exactly once — onDone is an inline callback, a new one each render
  useEffect(() => {
    if (!done || handedOff.current) return
    handedOff.current = true
    onDone()
  }, [done, onDone])

  if (hidden) return null

  return (
    <div
      className={`loader${done ? ' is-done' : ''}`}
      role="status"
      aria-live="polite"
      onTransitionEnd={(e) => {
        if (done && e.target === e.currentTarget && e.propertyName === 'opacity') setHidden(true)
      }}
    >
      <span className="splash-logo" aria-hidden />
    </div>
  )
}
