import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { createDesign, createItem, newId } from './model/factory'
import { clampAll, clampItem, findFreeSpot, snap } from './model/geometry'
import {
  parseDesign,
  type CameraView,
  type Contact,
  type Design,
  type ExtraOutput,
  type ExtraOutputKind,
  type Item,
  type ItemType,
  type ParseResult,
  type Room,
  type SensorKind,
} from './model/schema'

export type Tab = { id: string; design: Design }
export type ViewMode = '3d' | 'plan' | 'split'
type History = { past: Design[]; future: Design[] }

const HISTORY_CAP = 60
const STORAGE_KEY = 'gc_designer_v1'
const NO_HISTORY: History = { past: [], future: [] }

// ── autosave status + throttled localStorage ─────────────────────
// persist writes on every set (drags included); coalesce to one write per
// ~350 ms and skip writes whose payload didn't change (selection, hover…)

export const useSaveStatus = create<{ state: 'saved' | 'pending' | 'error' }>(() => ({ state: 'saved' }))

const pending = new Map<string, string>()
const written = new Map<string, string>()
let timer: ReturnType<typeof setTimeout> | undefined

function flush() {
  if (timer) clearTimeout(timer)
  timer = undefined
  if (!pending.size) return
  try {
    for (const [k, v] of pending) {
      localStorage.setItem(k, v)
      written.set(k, v)
    }
    useSaveStatus.setState({ state: 'saved' })
  } catch {
    useSaveStatus.setState({ state: 'error' })
  }
  pending.clear()
}

const throttledStorage: StateStorage = {
  getItem: (k) => {
    try {
      const v = pending.get(k) ?? localStorage.getItem(k)
      if (v !== null && !written.has(k)) written.set(k, v)
      return v
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    if (!pending.has(k) && written.get(k) === v) return
    pending.set(k, v)
    useSaveStatus.setState({ state: 'pending' })
    if (!timer) timer = setTimeout(flush, 350)
  },
  removeItem: (k) => {
    pending.delete(k)
    try {
      localStorage.removeItem(k)
    } catch {
      /* private mode */
    }
  },
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

// ── transient UI (toasts, import errors) ─────────────────────────

export type ImportFailure = Extract<ParseResult, { ok: false }>

export const useUi = create<{
  toast: { id: number; text: string } | null
  importError: ImportFailure | null
  showToast: (text: string) => void
  setImportError: (e: ImportFailure | null) => void
}>((set) => ({
  toast: null,
  importError: null,
  showToast: (text) => set((s) => ({ toast: { id: (s.toast?.id ?? 0) + 1, text } })),
  setImportError: (importError) => set({ importError }),
}))

// ── designs ──────────────────────────────────────────────────────

type State = {
  tabs: Tab[]
  activeId: string
  viewMode: ViewMode
  selectedId: string | null
  history: Record<string, History>
  /** bumped to ask the views to re-frame the room */
  frameNonce: number

  newTab: (name: string) => void
  importDesign: (d: Design) => void
  duplicateTab: (id: string, name: string) => void
  renameTab: (id: string, name: string) => void
  closeTab: (id: string) => void
  setActive: (id: string) => void

  setName: (name: string) => void
  updateRoom: (patch: Partial<Room>) => void
  addItem: (type: ItemType, kind?: SensorKind) => void
  updateItem: (id: string, patch: Partial<Item>, record?: boolean) => void
  removeItem: (id: string) => void
  duplicateItem: (id: string) => void
  rotateItem: (id: string, dir: 1 | -1) => void
  nudge: (id: string, dx: number, dz: number) => void
  addExtra: (kind: ExtraOutputKind) => void
  updateExtra: (index: number, patch: Partial<ExtraOutput>, record?: boolean) => void
  removeExtra: (index: number) => void
  setContact: (patch: Partial<Contact>) => void
  setCamera: (camera: CameraView) => void

  /** snapshot for undo before a gesture that edits without recording */
  checkpoint: () => void
  undo: () => void
  redo: () => void

  select: (id: string | null) => void
  setViewMode: (m: ViewMode) => void
  frame: () => void
}

export const activeTab = (s: Pick<State, 'tabs' | 'activeId'>) => s.tabs.find((t) => t.id === s.activeId) ?? s.tabs[0]

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const now = () => new Date().toISOString()
const firstTab = (): Tab => ({ id: newId(), design: createDesign('Sala 1') })

export const useDesigner = create<State>()(
  persist(
    (set, get) => {
      const initial = firstTab()

      /** apply `fn` to the active design; `record` pushes an undo snapshot */
      const commit = (fn: (d: Design) => Design, record = true) =>
        set((s) => {
          const tab = activeTab(s)
          const next = fn(tab.design)
          if (next === tab.design) return s
          const design = { ...next, updatedAt: now() }
          const h = s.history[tab.id] ?? NO_HISTORY
          return {
            tabs: s.tabs.map((t) => (t.id === tab.id ? { ...t, design } : t)),
            history: record
              ? { ...s.history, [tab.id]: { past: [...h.past, tab.design].slice(-HISTORY_CAP), future: [] } }
              : s.history,
          }
        })

      const findItem = (id: string) => activeTab(get()).design.items.find((i) => i.id === id)

      const openTab = (design: Design) => {
        const tab = { id: newId(), design }
        set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id, selectedId: null }))
      }

      return {
        tabs: [initial],
        activeId: initial.id,
        viewMode: 'split',
        selectedId: null,
        history: {},
        frameNonce: 0,

        newTab: (name) => openTab(createDesign(name)),
        importDesign: (d) => openTab(d),
        duplicateTab: (id, name) =>
          set((s) => {
            const i = s.tabs.findIndex((t) => t.id === id)
            if (i < 0) return s
            const t = now()
            const copy: Tab = { id: newId(), design: { ...structuredClone(s.tabs[i].design), name, createdAt: t, updatedAt: t } }
            const tabs = [...s.tabs.slice(0, i + 1), copy, ...s.tabs.slice(i + 1)]
            return { tabs, activeId: copy.id, selectedId: null }
          }),
        renameTab: (id, name) => {
          const n = name.trim().slice(0, 80)
          if (!n) return
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id && t.design.name !== n ? { ...t, design: { ...t.design, name: n, updatedAt: now() } } : t,
            ),
          }))
        },
        closeTab: (id) =>
          set((s) => {
            const i = s.tabs.findIndex((t) => t.id === id)
            if (i < 0) return s
            const tabs = s.tabs.filter((t) => t.id !== id)
            if (!tabs.length) tabs.push(firstTab())
            const wasActive = s.activeId === id
            const history = { ...s.history }
            delete history[id]
            return {
              tabs,
              history,
              activeId: wasActive ? tabs[Math.min(i, tabs.length - 1)].id : s.activeId,
              selectedId: wasActive ? null : s.selectedId,
            }
          }),
        setActive: (id) => set((s) => (s.activeId === id ? s : { activeId: id, selectedId: null })),

        setName: (name) => get().renameTab(get().activeId, name),
        updateRoom: (patch) => commit((d) => (sameJson({ ...d.room, ...patch }, d.room) ? d : clampAll({ ...d, room: { ...d.room, ...patch } }))),

        addItem: (type, kind) => {
          const d = activeTab(get()).design
          const probe = createItem(type, d.room, kind)
          const item = clampItem({ ...probe, ...findFreeSpot(d, probe) }, d.room)
          commit((dd) => ({ ...dd, items: [...dd.items, item] }))
          set({ selectedId: item.id })
        },
        updateItem: (id, patch, record = true) =>
          commit((d) => {
            let changed = false
            const items = d.items.map((it) => {
              if (it.id !== id) return it
              const next = clampItem({ ...it, ...patch }, d.room)
              if (sameJson(next, it)) return it
              changed = true
              return next
            })
            return changed ? { ...d, items } : d
          }, record),
        removeItem: (id) => {
          commit((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }))
          set((s) => (s.selectedId === id ? { selectedId: null } : s))
        },
        duplicateItem: (id) => {
          const src = findItem(id)
          if (!src) return
          const room = activeTab(get()).design.room
          const copy = clampItem({ ...src, id: newId(), x: snap(src.x + 0.5), z: snap(src.z + 0.5) }, room)
          commit((d) => ({ ...d, items: [...d.items, copy] }))
          set({ selectedId: copy.id })
        },
        rotateItem: (id, dir) => {
          const it = findItem(id)
          if (it) get().updateItem(id, { rotation: (it.rotation + dir + 4) % 4 })
        },
        nudge: (id, dx, dz) => {
          const it = findItem(id)
          if (it) get().updateItem(id, { x: snap(it.x + dx), z: snap(it.z + dz) })
        },

        addExtra: (kind) =>
          commit((d) => {
            const i = d.extraOutputs.findIndex((e) => e.kind === kind && !e.note)
            const extraOutputs =
              i >= 0
                ? d.extraOutputs.map((e, k) => (k === i ? { ...e, quantity: Math.min(999, e.quantity + 1) } : e))
                : [...d.extraOutputs, { kind, quantity: 1, note: '' }]
            return { ...d, extraOutputs }
          }),
        updateExtra: (index, patch, record = true) =>
          commit(
            (d) => ({ ...d, extraOutputs: d.extraOutputs.map((e, k) => (k === index ? { ...e, ...patch } : e)) }),
            record,
          ),
        removeExtra: (index) => commit((d) => ({ ...d, extraOutputs: d.extraOutputs.filter((_, k) => k !== index) })),
        setContact: (patch) => commit((d) => ({ ...d, contact: { ...d.contact, ...patch } }), false),

        // the saved view isn't an edit: no undo entry, no updatedAt bump
        setCamera: (camera) =>
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === s.activeId ? { ...t, design: { ...t.design, camera } } : t)),
          })),

        checkpoint: () =>
          set((s) => {
            const tab = activeTab(s)
            const h = s.history[tab.id] ?? NO_HISTORY
            return { history: { ...s.history, [tab.id]: { past: [...h.past, tab.design].slice(-HISTORY_CAP), future: [] } } }
          }),
        undo: () =>
          set((s) => {
            const tab = activeTab(s)
            const h = s.history[tab.id]
            if (!h?.past.length) return s
            const prev = { ...h.past[h.past.length - 1], camera: tab.design.camera }
            return {
              tabs: s.tabs.map((t) => (t.id === tab.id ? { ...t, design: prev } : t)),
              history: { ...s.history, [tab.id]: { past: h.past.slice(0, -1), future: [tab.design, ...h.future].slice(0, HISTORY_CAP) } },
              selectedId: prev.items.some((i) => i.id === s.selectedId) ? s.selectedId : null,
            }
          }),
        redo: () =>
          set((s) => {
            const tab = activeTab(s)
            const h = s.history[tab.id]
            if (!h?.future.length) return s
            const next = { ...h.future[0], camera: tab.design.camera }
            return {
              tabs: s.tabs.map((t) => (t.id === tab.id ? { ...t, design: next } : t)),
              history: { ...s.history, [tab.id]: { past: [...h.past, tab.design].slice(-HISTORY_CAP), future: h.future.slice(1) } },
              selectedId: next.items.some((i) => i.id === s.selectedId) ? s.selectedId : null,
            }
          }),

        select: (id) => set((s) => (s.selectedId === id ? s : { selectedId: id })),
        setViewMode: (viewMode) => set({ viewMode }),
        frame: () => set((s) => ({ frameNonce: s.frameNonce + 1 })),
      }
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => throttledStorage),
      partialize: (s) => ({ tabs: s.tabs, activeId: s.activeId, viewMode: s.viewMode }),
      // every stored tab goes through the same validation as an imported
      // file; a corrupt one is dropped rather than loaded half-way
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as { tabs?: unknown; activeId?: unknown; viewMode?: unknown }
        const tabs: Tab[] = []
        if (Array.isArray(p.tabs)) {
          for (const t of p.tabs as Array<{ id?: unknown; design?: unknown }>) {
            if (!t || typeof t.id !== 'string') continue
            const r = parseDesign(t.design)
            if (r.ok) tabs.push({ id: t.id, design: r.design })
            else console.warn('[designer] dropped an unreadable saved design', r)
          }
        }
        if (!tabs.length) return current
        const activeId = tabs.some((t) => t.id === p.activeId) ? (p.activeId as string) : tabs[0].id
        const viewMode = p.viewMode === '3d' || p.viewMode === 'plan' || p.viewMode === 'split' ? p.viewMode : current.viewMode
        return { ...current, tabs, activeId, viewMode }
      },
    },
  ),
)

export const useActiveDesign = () => useDesigner((s) => activeTab(s).design)
export const getActiveDesign = () => activeTab(useDesigner.getState()).design
