import { useEffect, useState } from 'react'
import { SECTION_EVENT, scrollState } from '../lib/scroll'

/**
 * The in-flow section currently in view, as published by Solutions. `null`
 * means the 3D story is on screen — which is exactly HOME.
 */
export function useActiveSection() {
  const [active, setActive] = useState<string | null>(scrollState.section)

  useEffect(() => {
    const onSection = (e: Event) => setActive((e as CustomEvent<string | null>).detail)
    window.addEventListener(SECTION_EVENT, onSection)
    return () => window.removeEventListener(SECTION_EVENT, onSection)
  }, [])

  return active
}
