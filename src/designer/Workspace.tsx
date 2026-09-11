import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { D } from './i18n/messages'
import { useFileDrop, useMediaQuery, useShortcuts } from './hooks'
import ImportErrorDialog from './panels/ImportErrorDialog'
import Inspector from './panels/Inspector'
import StepsPanel from './panels/StepsPanel'
import SummaryPanel from './panels/SummaryPanel'
import TopBar from './panels/TopBar'
import PlanView from './plan/PlanView'
import DesignerCanvas from './scene/DesignerCanvas'
import { useDesigner, type ViewMode } from './store'
import Glyph from './ui/Glyph'
import Segmented from './ui/Segmented'
import Toast from './ui/Toast'

type MobileTab = 'design' | 'item' | 'summary'

const NARROW = '(max-width: 720px)'

export default function Workspace() {
  const intl = useIntl()
  const t = intl.formatMessage
  const viewMode = useDesigner((s) => s.viewMode)
  const narrow = useMediaQuery(NARROW)
  const [mtab, setMtab] = useState<MobileTab>('design')
  const dropping = useFileDrop(intl)
  useShortcuts()

  useEffect(() => {
    const prev = document.title
    document.title = t(D.docTitle)
    return () => {
      document.title = prev
    }
  }, [t])

  // on phones, picking something brings its inspector up
  useEffect(
    () =>
      useDesigner.subscribe((s, p) => {
        if (s.selectedId && s.selectedId !== p.selectedId && window.matchMedia(NARROW).matches) setMtab('item')
      }),
    [],
  )

  const mode: ViewMode = narrow && viewMode === 'split' ? '3d' : viewMode

  return (
    <div className="dz" data-mtab={mtab}>
      <TopBar />

      <aside className="dz-left" aria-label={t(D.kicker)}>
        <StepsPanel />
      </aside>

      <main className="dz-stage">
        <ViewBar mode={mode} narrow={narrow} />
        <div className={`dz-views is-${mode}`}>
          {mode !== 'plan' && (
            <div className="dz-view dz-view-3d">
              <DesignerCanvas />
              <p className="dz-view-hint">{t(D.hint3d)}</p>
            </div>
          )}
          {mode !== '3d' && (
            <div className="dz-view dz-view-plan">
              <PlanView />
              <p className="dz-view-hint">{t(D.hintPlan)}</p>
            </div>
          )}
        </div>
      </main>

      <aside className="dz-right" aria-label={t(D.summary)}>
        <Inspector />
        <SummaryPanel />
      </aside>

      <nav className="dz-mtabs" role="tablist">
        {(
          [
            ['design', 'list', D.mDesign],
            ['item', 'sliders', D.mItem],
            ['summary', 'sum', D.mSummary],
          ] as const
        ).map(([key, glyph, msg]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mtab === key}
            className={mtab === key ? 'is-on' : undefined}
            onClick={() => setMtab(key)}
          >
            <Glyph name={glyph} />
            {t(msg)}
          </button>
        ))}
      </nav>

      <ImportErrorDialog />
      <Toast />
      {dropping && (
        <div className="dz-drop" aria-hidden>
          <div className="dz-drop-inner">
            <Glyph name="upload" />
            <span>{t(D.dropHint)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewBar({ mode, narrow }: { mode: ViewMode; narrow: boolean }) {
  const intl = useIntl()
  const t = intl.formatMessage
  const setViewMode = useDesigner((s) => s.setViewMode)
  const frame = useDesigner((s) => s.frame)
  const options = [
    { value: '3d' as const, label: <><Glyph name="cube" />{t(D.view3d)}</> },
    { value: 'plan' as const, label: <><Glyph name="plan" />{t(D.viewPlan)}</> },
    ...(narrow ? [] : [{ value: 'split' as const, label: <><Glyph name="split" />{t(D.viewSplit)}</> }]),
  ]
  return (
    <div className="dz-viewbar">
      <Segmented label={t(D.viewAria)} value={mode} options={options} onChange={setViewMode} />
      <button type="button" className="dz-btn dz-icon-btn dz-glass" onClick={frame} aria-label={t(D.frame)} title={t(D.frame)}>
        <Glyph name="frame" />
      </button>
    </div>
  )
}
