import { useLayoutEffect } from 'react'
import type { DesignerKind } from '../lib/route'
import './designer.css'
import DesignerIntl from './i18n/DesignerIntl'
import { useDesigner } from './store'
import Workspace from './Workspace'

/**
 * Free, public designers (lazy chunk behind /disenador…): grow rooms, grain
 * plants and curing rooms share this engine, each with its own catalog. Designs
 * live in tabs autosaved to localStorage and travel as versioned JSON files.
 */
export default function Designer({ kind }: { kind: DesignerKind }) {
  const ready = useDesigner((s) => s.kind === kind)
  // switch before paint, so a route change never flashes the other designer's tab
  useLayoutEffect(() => {
    useDesigner.getState().setKind(kind)
  }, [kind])
  return <DesignerIntl>{ready && <Workspace />}</DesignerIntl>
}
