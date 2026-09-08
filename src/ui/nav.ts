import type { MouseEvent } from 'react'
import { M } from '../i18n/messages'
import { scrollToSection } from '../lib/scroll'

/** In-flow sections reachable from the side menu / mobile sheet. */
export const NAV = [
  { id: 'cultivo', msg: M.navCultivo },
  { id: 'silos', msg: M.navSilos },
  { id: 'maduracion', msg: M.navMaduracion },
  { id: 'contacto', msg: M.navContacto },
] as const

export type SectionId = (typeof NAV)[number]['id']

export const isSectionId = (s: string): s is SectionId => NAV.some((n) => n.id === s)

/** Click handler for `href="#id"` links: glide instead of the native jump. */
export function onAnchorClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  const id = e.currentTarget.getAttribute('href')?.slice(1)
  if (!id) return
  e.preventDefault()
  scrollToSection(id)
}
