import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { D } from './i18n/messages'
import { fmt } from './labels'
import { designSlug, saveBlob } from './model/io'
import { jpegPdf } from './model/pdf'
import { computeSummary } from './model/summary'
import { getActiveDesign, useUi } from './store'

/**
 * "Take a picture": whatever views are on screen — the 3D scene, the plan, or
 * both side by side — composed onto one page under a header and saved as a
 * PDF. Each view registers how to read itself while it is mounted.
 */

let sceneSource: (() => HTMLCanvasElement) | null = null
let planSource: (() => SVGSVGElement | null) | null = null

export function registerScene(fn: () => HTMLCanvasElement) {
  sceneSource = fn
  return () => {
    if (sceneSource === fn) sceneSource = null
  }
}

export function registerPlan(fn: () => SVGSVGElement | null) {
  planSource = fn
  return () => {
    if (planSource === fn) planSource = null
  }
}

const BG = '#17171b'
const FG = '#f2f2f6'
const DIM = 'rgba(242, 242, 246, 0.62)'
const BRAND = '#cad86e'
const FONT = 'Aeonik, system-ui, sans-serif'
/** header band, CSS px */
const HEADER = 64
/** output pixels per CSS px */
const SCALE = 2

/**
 * The plan is styled by the stylesheet, which an SVG drawn as an image never
 * sees — so the computed values are written onto every node of a copy.
 */
const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'paint-order',
  'vector-effect',
  'visibility',
]

async function planImage(svg: SVGSVGElement, w: number, h: number) {
  const copy = svg.cloneNode(true) as SVGSVGElement
  const from = [svg, ...svg.querySelectorAll('*')]
  const to = [copy, ...copy.querySelectorAll('*')]
  from.forEach((el, i) => {
    const cs = getComputedStyle(el)
    to[i].setAttribute('style', STYLE_PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';'))
  })
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('width', String(w))
  copy.setAttribute('height', String(h))
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`
  await img.decode()
  return img
}

type Header = { title: string; line: string; stamp: string }
type Part = { rect: DOMRect; source: CanvasImageSource }

async function compose(head: Header): Promise<HTMLCanvasElement | null> {
  const parts: Part[] = []

  // the scene first, before anything awaits: its frame is only readable now
  const scene = sceneSource?.()
  if (scene) {
    const copy = document.createElement('canvas')
    copy.width = scene.width
    copy.height = scene.height
    copy.getContext('2d')?.drawImage(scene, 0, 0)
    parts.push({ rect: scene.getBoundingClientRect(), source: copy })
  }
  const svg = planSource?.()
  if (svg) {
    const rect = svg.getBoundingClientRect()
    parts.push({ rect, source: await planImage(svg, rect.width, rect.height) })
  }
  if (!parts.length) return null

  // lay the views out exactly as they sit on screen
  const left = Math.min(...parts.map((p) => p.rect.left))
  const top = Math.min(...parts.map((p) => p.rect.top))
  const W = Math.max(...parts.map((p) => p.rect.right)) - left
  const H = Math.max(...parts.map((p) => p.rect.bottom)) - top

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(W * SCALE)
  canvas.height = Math.round((H + HEADER) * SCALE)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(SCALE, SCALE)
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H + HEADER)
  for (const p of parts) ctx.drawImage(p.source, p.rect.left - left, HEADER + p.rect.top - top, p.rect.width, p.rect.height)

  await document.fonts.ready
  ctx.fillStyle = 'rgba(242, 242, 246, 0.1)'
  ctx.fillRect(0, HEADER - 1, W, 1)
  ctx.fillStyle = FG
  ctx.font = `500 18px ${FONT}`
  ctx.fillText(head.title, 20, 30)
  ctx.fillStyle = DIM
  ctx.font = `400 12px ${FONT}`
  ctx.fillText(head.line, 20, 49)
  ctx.textAlign = 'right'
  ctx.fillStyle = BRAND
  ctx.font = `500 12px ${FONT}`
  ctx.fillText('GROWCAST', W - 20, 30)
  ctx.fillStyle = DIM
  ctx.font = `400 12px ${FONT}`
  ctx.fillText(head.stamp, W - 20, 49)
  return canvas
}

/** Save the views on screen as `<design>.pdf`. */
export function useSnapshotPdf() {
  const intl = useIntl()
  return useCallback(async () => {
    const t = intl.formatMessage
    const ui = useUi.getState()
    const d = getActiveDesign()
    const area = computeSummary(d).area
    const size = { w: fmt(d.room.width, 1), l: fmt(d.room.length, 1), h: fmt(d.room.height, 1), area: fmt(area, 1) }
    const head = {
      title: d.name,
      line: t(d.room.shape === 'round' ? D.roomLineRound : D.roomLine, size),
      stamp: new Date().toLocaleDateString(intl.locale, { year: 'numeric', month: 'short', day: 'numeric' }),
    }
    try {
      const canvas = await compose(head)
      if (!canvas) return
      const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      if (!jpeg) throw new Error('jpeg')
      const file = `${designSlug(d)}.pdf`
      saveBlob(jpegPdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height), file)
      ui.showToast(t(D.toastExported, { file }))
    } catch {
      ui.showToast(t(D.pdfFailed))
    }
  }, [intl])
}
