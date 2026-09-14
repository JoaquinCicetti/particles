import { lazy, Suspense } from 'react'
import { DESIGNER_PATH, loadDesigner, usePath } from './lib/route'

// each view is its own chunk: the designer never pulls the particle engine,
// the landing never pulls the designer; react/three/r3f are shared
const Landing = lazy(() => import('./App'))
const Designer = lazy(loadDesigner)

export default function Root() {
  const path = usePath()
  return (
    <Suspense fallback={<RouteFallback />}>{path === DESIGNER_PATH ? <Designer /> : <Landing />}</Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="loader" role="status">
      <span className="splash-logo" aria-hidden />
    </div>
  )
}
