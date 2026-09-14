import { KINDS } from './kinds'
import { parseDesign, type Design, type ParseResult } from './schema'
import { computeSummary, summaryBlock } from './summary'

const MAX_BYTES = 5 * 1024 * 1024

export function toFileJson(d: Design): string {
  const out = { ...d, updatedAt: new Date().toISOString(), summary: summaryBlock(computeSummary(d)) }
  return JSON.stringify(out, null, 2)
}

/** File-name stem for a design: its name, slugged, or the kind's default. */
export function designSlug(d: Design): string {
  const slug = d.name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug || KINDS[d.roomKind].fileSlug
}

export const designFileName = (d: Design) => `${designSlug(d)}.growcast.json`

/** Hand a blob to the browser as a download. */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Save the design as a .json file; returns the file name. */
export function downloadDesign(d: Design): string {
  const name = designFileName(d)
  saveBlob(new Blob([toFileJson(d)], { type: 'application/json' }), name)
  return name
}

export async function readDesignFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_BYTES) return { ok: false, reason: 'size', issues: [] }
  let raw: unknown
  try {
    raw = JSON.parse(await file.text())
  } catch {
    return { ok: false, reason: 'json', issues: [] }
  }
  return parseDesign(raw)
}
