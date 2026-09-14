import { lazy, Suspense } from 'react'
import { designerKindAt, legalDocAt, loadDesigner, usePath } from './lib/route'

// each view is its own chunk: the designer never pulls the particle engine,
// the landing never pulls the designer; react/three/r3f are shared
const Landing = lazy(() => import('./App'))
const Designer = lazy(loadDesigner)
const Legal = lazy(() => import('./legal/LegalPage'))

export default function Root() {
  const path = usePath()
  const kind = designerKindAt(path)
  const doc = legalDocAt(path)
  // the three designers are one component: switching between them keeps it mounted
  return (
    <Suspense fallback={<RouteFallback />}>
      {kind ? <Designer kind={kind} /> : doc ? <Legal doc={doc} /> : <Landing />}
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="loader" role="status">
      <span className="splash-logo" aria-hidden />
    </div>
  )
}
