import { useRef } from 'react'
import { useIntl } from 'react-intl'
import LangPicker from '../../ui/LangPicker'
import { onNavClick } from '../../lib/route'
import { D } from '../i18n/messages'
import { openDesignFile } from '../actions'
import { MOD_KEY } from '../labels'
import { KINDS } from '../model/kinds'
import { DESIGN_KINDS } from '../model/schema'
import { useDesigner, useKind, useSaveStatus, useUi } from '../store'
import Glyph from '../ui/Glyph'
import TabStrip from './TabStrip'

export default function TopBar() {
  const intl = useIntl()
  const t = intl.formatMessage
  const kind = useKind()
  const canUndo = useDesigner((s) => (s.history[s.activeId]?.past.length ?? 0) > 0)
  const canRedo = useDesigner((s) => (s.history[s.activeId]?.future.length ?? 0) > 0)
  const undo = useDesigner((s) => s.undo)
  const redo = useDesigner((s) => s.redo)
  const setFinishOpen = useUi((s) => s.setFinishOpen)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <header className="dz-top">
      <a className="dz-brand" href="/" onClick={onNavClick} aria-label={t(D.backHome)} title={t(D.backHome)}>
        <span className="dz-logo">
          <span className="brand-mark" aria-hidden />
          <span className="dz-wordmark">Growcast</span>
        </span>
        <span className="dz-brand-kicker">{t(KINDS[kind].text.kicker)}</span>
      </a>

      <KindNav />
      <TabStrip />

      <div className="dz-actions">
        <SaveStatus />
        <div className="dz-btn-group">
          <button
            type="button"
            className="dz-btn dz-icon-btn"
            onClick={undo}
            disabled={!canUndo}
            aria-label={t(D.undo)}
            title={`${t(D.undo)} (${MOD_KEY}Z)`}
          >
            <Glyph name="undo" />
          </button>
          <button
            type="button"
            className="dz-btn dz-icon-btn"
            onClick={redo}
            disabled={!canRedo}
            aria-label={t(D.redo)}
            title={`${t(D.redo)} (${MOD_KEY}⇧Z)`}
          >
            <Glyph name="redo" />
          </button>
        </div>
        {/* the label collapses on phones, so name the button explicitly —
            otherwise its accessible name falls back to the long title hint */}
        <button
          type="button"
          className="dz-btn"
          onClick={() => fileRef.current?.click()}
          aria-label={t(D.importBtn)}
          title={t(D.importHint)}
        >
          <Glyph name="upload" />
          <span className="dz-btn-label">{t(D.importBtn)}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void openDesignFile(file, intl)
          }}
        />
        <button
          type="button"
          className="dz-btn dz-btn-primary"
          onClick={() => setFinishOpen(true)}
          aria-label={t(D.finish)}
          title={t(D.finishHint)}
        >
          <Glyph name="send" />
          <span className="dz-btn-label">{t(D.finish)}</span>
        </button>
        <LangPicker />
      </div>
    </header>
  )
}

/** The three designers are one engine on three routes; this hops between them. */
function KindNav() {
  const t = useIntl().formatMessage
  const kind = useKind()
  return (
    <nav className="dz-kindnav" aria-label={t(D.kindNavAria)}>
      {DESIGN_KINDS.map((k) => (
        <a
          key={k}
          href={KINDS[k].path}
          onClick={onNavClick}
          className={k === kind ? 'is-on' : undefined}
          aria-current={k === kind ? 'page' : undefined}
          title={t(KINDS[k].text.kicker)}
        >
          <Glyph name={KINDS[k].glyph} />
          <span>{t(KINDS[k].text.nav)}</span>
        </a>
      ))}
    </nav>
  )
}

function SaveStatus() {
  const intl = useIntl()
  const state = useSaveStatus((s) => s.state)
  const label = intl.formatMessage(state === 'pending' ? D.saving : state === 'error' ? D.saveError : D.saved)
  return (
    <span className={`dz-save is-${state}`} role="status" title={label}>
      <i aria-hidden />
      <span className="dz-save-label">{label}</span>
    </span>
  )
}
