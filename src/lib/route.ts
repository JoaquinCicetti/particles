import { useSyncExternalStore, type MouseEvent } from 'react'

/**
 * Minimal path routing for the single entry point: `main.tsx` renders the
 * landing or the (lazy) designer depending on `location.pathname`. In-app
 * links push history instead of reloading, so shared chunks stay warm.
 */

/** One designer engine, three catalogs: each kind has its own route. */
export const DESIGNER_PATHS = {
  grow: '/disenador',
  silo: '/disenador/silos',
  curing: '/disenador/maduracion',
} as const

export type DesignerKind = keyof typeof DESIGNER_PATHS

export const designerKindAt = (path: string): DesignerKind | null =>
  (Object.keys(DESIGNER_PATHS) as DesignerKind[]).find((k) => DESIGNER_PATHS[k] === path) ?? null

/** The designer chunk — also used to prefetch it on hover. */
export const loadDesigner = () => import('../designer/Designer')

const NAV_EVENT = 'gc:navigate'

const readPath = () => location.pathname.replace(/\/+$/, '') || '/'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAV_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAV_EVENT, onChange)
  }
}

export const usePath = () => useSyncExternalStore(subscribe, readPath, () => '/')

export function navigate(path: string) {
  if (readPath() === path) return
  history.pushState(null, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new Event(NAV_EVENT))
}

/** Click handler for in-app `<a href="/…">` links (keeps modifier-click). */
export function onNavClick(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  const href = e.currentTarget.getAttribute('href')
  if (!href) return
  e.preventDefault()
  navigate(href)
}
