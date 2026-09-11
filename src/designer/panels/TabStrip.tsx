import { useCallback, useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'
import { useDesigner, type Tab } from '../store'
import Glyph from '../ui/Glyph'
import Modal from '../ui/Modal'

type Menu = { id: string; x: number; y: number }

/** One tab per design: switch, rename (double-click), duplicate, close. */
export default function TabStrip() {
  const intl = useIntl()
  const t = intl.formatMessage
  const tabs = useDesigner((s) => s.tabs)
  const activeId = useDesigner((s) => s.activeId)
  const [editing, setEditing] = useState<string | null>(null)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [confirm, setConfirm] = useState<Tab | null>(null)
  const cancelEdit = useRef(false)
  const closeMenu = useCallback(() => setMenu(null), [])
  const closeConfirm = useCallback(() => setConfirm(null), [])

  const freeName = () => {
    const names = new Set(tabs.map((x) => x.design.name))
    for (let n = 1; ; n++) {
      const name = t(D.defaultName, { n })
      if (!names.has(name)) return name
    }
  }

  const requestClose = (tab: Tab) => {
    setMenu(null)
    if (tab.design.items.length) setConfirm(tab)
    else useDesigner.getState().closeTab(tab.id)
  }

  const menuTab = menu && tabs.find((x) => x.id === menu.id)

  return (
    <>
      <div className="dz-tabs" role="tablist" aria-label={t(D.tabsAria)}>
        {tabs.map((tab) => {
          const active = tab.id === activeId
          return (
            <div key={tab.id} className={`dz-tab${active ? ' is-active' : ''}`}>
              {editing === tab.id ? (
                <input
                  className="dz-tab-input"
                  autoFocus
                  defaultValue={tab.design.name}
                  maxLength={80}
                  aria-label={t(D.tabRename)}
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={(e) => {
                    if (!cancelEdit.current) useDesigner.getState().renameTab(tab.id, e.currentTarget.value)
                    cancelEdit.current = false
                    setEditing(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') {
                      cancelEdit.current = true
                      e.currentTarget.blur()
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className="dz-tab-btn"
                  title={tab.design.name}
                  onClick={() => useDesigner.getState().setActive(tab.id)}
                  onDoubleClick={() => setEditing(tab.id)}
                >
                  <span className="dz-tab-dot" aria-hidden />
                  <span className="dz-tab-name">{tab.design.name}</span>
                </button>
              )}
              <button
                type="button"
                className="dz-tab-more"
                aria-label={t(D.tabMenu)}
                aria-haspopup="menu"
                aria-expanded={menu?.id === tab.id}
                onClick={(e) => {
                  if (menu?.id === tab.id) return setMenu(null)
                  const r = e.currentTarget.getBoundingClientRect()
                  setMenu({ id: tab.id, x: Math.min(r.left, window.innerWidth - 200), y: r.bottom + 6 })
                }}
              >
                <Glyph name="dots" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          className="dz-tab-new"
          onClick={() => useDesigner.getState().newTab(freeName())}
          aria-label={t(D.tabNew)}
          title={t(D.tabNew)}
        >
          <Glyph name="plus" />
        </button>
      </div>

      {menu && menuTab && (
        <TabMenu
          x={menu.x}
          y={menu.y}
          onDismiss={closeMenu}
          onRename={() => {
            setMenu(null)
            setEditing(menuTab.id)
          }}
          onDuplicate={() => {
            setMenu(null)
            useDesigner.getState().duplicateTab(menuTab.id, t(D.copyName, { name: menuTab.design.name }))
          }}
          onClose={() => requestClose(menuTab)}
        />
      )}

      <Modal open={!!confirm} onClose={closeConfirm} label={t(D.tabClose)}>
        {confirm && (
          <>
            <span className="kicker">{t(D.kicker)}</span>
            <h3 className="dialog-title">{t(D.confirmCloseTitle, { name: confirm.design.name })}</h3>
            <p className="dialog-sub">{t(D.confirmCloseBody, { count: confirm.design.items.length })}</p>
            <div className="dz-modal-actions">
              <button type="button" className="dz-btn" onClick={closeConfirm}>
                {t(D.cancel)}
              </button>
              <button
                type="button"
                className="dz-btn dz-btn-danger"
                autoFocus
                onClick={() => {
                  useDesigner.getState().closeTab(confirm.id)
                  setConfirm(null)
                }}
              >
                {t(D.confirmCloseOk)}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

function TabMenu({
  x,
  y,
  onDismiss,
  onRename,
  onDuplicate,
  onClose,
}: {
  x: number
  y: number
  onDismiss: () => void
  onRename: () => void
  onDuplicate: () => void
  onClose: () => void
}) {
  const intl = useIntl()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const el = e.target as Element
      if (ref.current?.contains(el) || el.closest?.('.dz-tab-more')) return
      onDismiss()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('keydown', key)
    window.addEventListener('resize', onDismiss)
    ref.current?.querySelector('button')?.focus()
    return () => {
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('keydown', key)
      window.removeEventListener('resize', onDismiss)
    }
  }, [onDismiss])

  return (
    <div ref={ref} className="dz-menu" role="menu" style={{ left: Math.max(8, x), top: y }}>
      <button type="button" role="menuitem" onClick={onRename}>
        <Glyph name="sliders" />
        {intl.formatMessage(D.tabRename)}
      </button>
      <button type="button" role="menuitem" onClick={onDuplicate}>
        <Glyph name="copy" />
        {intl.formatMessage(D.tabDuplicate)}
      </button>
      <button type="button" role="menuitem" className="is-danger" onClick={onClose}>
        <Glyph name="close" />
        {intl.formatMessage(D.tabClose)}
      </button>
    </div>
  )
}
