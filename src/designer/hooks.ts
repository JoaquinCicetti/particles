import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { IntlShape } from 'react-intl'
import { openDesignFile } from './actions'
import { useDesigner } from './store'

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

const isTyping = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest('input, textarea, select, [contenteditable="true"]')

/** Editor shortcuts; inert while typing or while a dialog is open. */
export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || document.querySelector('.dialog-backdrop')) return
      const s = useDesigner.getState()
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      if (mod && (key === 'z' || key === 'y')) {
        e.preventDefault()
        if (key === 'y' || e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (e.key === 'Escape') {
        s.select(null)
        return
      }
      const id = s.selectedId
      if (!id) return
      if (mod && key === 'd') {
        e.preventDefault()
        s.duplicateItem(id)
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        s.removeItem(id)
      } else if (!mod && key === 'r') {
        s.rotateItem(id, e.shiftKey ? -1 : 1)
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 1 : 0.1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dz = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        s.nudge(id, dx, dz)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** Drop a .json anywhere on the page to open it; returns "a file is over us". */
export function useFileDrop(intl: IntlShape) {
  const [over, setOver] = useState(false)
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth += 1
      setOver(true)
    }
    const dragOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    }
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      depth = Math.max(0, depth - 1)
      if (!depth) setOver(false)
    }
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setOver(false)
      const file = e.dataTransfer?.files[0]
      if (file) void openDesignFile(file, intl)
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragover', dragOver)
    window.addEventListener('dragleave', leave)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragover', dragOver)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('drop', drop)
    }
  }, [intl])
  return over
}
