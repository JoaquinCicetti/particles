import './designer.css'
import DesignerIntl from './i18n/DesignerIntl'
import Workspace from './Workspace'

/**
 * Free, public grow-room designer (lazy chunk behind /disenador). Designs
 * live in tabs autosaved to localStorage and travel as versioned JSON files.
 */
export default function Designer() {
  return (
    <DesignerIntl>
      <Workspace />
    </DesignerIntl>
  )
}
