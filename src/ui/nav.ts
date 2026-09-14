import type { MouseEvent } from 'react'
import { M } from '../i18n/messages'
import { scrollToSection } from '../lib/scroll'

/**
 * `top` is the 3D story itself: it has no DOM element, so `scrollToSection`
 * sends it to y=0 and it reads as active whenever no in-flow section is in
 * view. It is not one of the sections, so the side index and the mobile sheet
 * show it apart, above the list.
 */
export const HOME = { id: 'top', msg: M.navInicio } as const

/** The sections, in page order: the three solutions, then contact. */
export const NAV = [
  { id: 'silos', msg: M.navSilos },
  { id: 'cultivo', msg: M.navCultivo },
  { id: 'maduracion', msg: M.navMaduracion },
  { id: 'contacto', msg: M.navContacto },
] as const

/** Click handler for `href="#id"` links: jump there without a native fragment scroll. */
export function onAnchorClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  const id = e.currentTarget.getAttribute('href')?.slice(1)
  if (!id) return
  e.preventDefault()
  scrollToSection(id)
}
