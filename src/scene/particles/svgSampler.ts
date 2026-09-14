import { createRandom } from '../../lib/random'

/**
 * Rasterizes an SVG to an offscreen canvas once, then reads it two ways: its
 * lit pixels sampled into world-space particle targets on a plane at z≈0, and
 * its outer silhouette, which the finale's traces land on. The SVG's own
 * colors are irrelevant — particles are recolored lime by the shader.
 */

export interface SvgRaster {
  /** RGBA pixels, row by row from the top */
  data: Uint8ClampedArray
  W: number
  H: number
}

export interface SvgPlacement {
  /** target world height the rasterized art maps to */
  worldHeight: number
  /** world-space Y the art is centered on */
  centerY: number
  /** alpha cutoff for a pixel to count as "lit" */
  threshold?: number
}

export interface SvgSampleOptions extends SvgPlacement {
  /** pixel step when scanning (1 = densest, 2 = default) */
  step?: number
  /** z spread + per-axis jitter */
  depth?: number
  seed?: number
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Rasterize at the given height (taller = finer sampling of thin strokes). */
export async function rasterizeSvg(url: string, rasterHeight = 900): Promise<SvgRaster> {
  // Fetch the markup and force explicit width/height from the viewBox —
  // SVGs sized only by viewBox (or by a CSS class) rasterize empty when
  // loaded straight as an <img>. Then load via data-URI.
  const text = await fetch(url).then((r) => r.text())
  const vb = text.match(/viewBox="([-\d.\s]+)"/)
  let vbW = 1
  let vbH = 1
  if (vb) {
    const p = vb[1].trim().split(/\s+/).map(Number)
    vbW = p[2] || 1
    vbH = p[3] || 1
  }
  const sized = /<svg[^>]*\swidth=/.test(text)
    ? text
    : text.replace(/<svg/, `<svg width="${vbW}" height="${vbH}"`)
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized)

  const img = await loadImage(dataUri)
  const H = rasterHeight
  const W = Math.round(H * (vbW / vbH))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, W, H)
  return { data: ctx.getImageData(0, 0, W, H).data, W, H }
}

/** Sample `count` world-space targets off the lit pixels; a halo if there are none. */
export function sampleRasterPoints(
  raster: SvgRaster | null,
  count: number,
  opts: SvgSampleOptions,
): Float32Array {
  const { worldHeight, centerY, step = 2, threshold = 100, depth = 0.08, seed = 20260613 } = opts

  const random = createRandom(seed)
  const out = new Float32Array(count * 3)

  const candidates: number[] = []
  if (raster) {
    const { data, W, H } = raster
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > threshold) candidates.push(x, y)
      }
    }
  }

  const n = candidates.length / 2
  if (!raster || n === 0) {
    // degenerate fallback: a halo ring sized to the requested world height
    const r = worldHeight * 0.55
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2
      out[i * 3] = Math.cos(a) * r
      out[i * 3 + 1] = centerY + Math.sin(a) * r
      out[i * 3 + 2] = (random() - 0.5) * depth
    }
    return out
  }

  const { W, H } = raster
  const scale = worldHeight / H

  // shuffle candidate order so cyclic assignment doesn't band by row
  const order = new Uint32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }

  const jit = scale * step * 0.5
  for (let i = 0; i < count; i++) {
    const c = order[i % n] * 2
    out[i * 3] = (candidates[c] - W / 2) * scale + (random() - 0.5) * jit
    out[i * 3 + 1] = (H / 2 - candidates[c + 1]) * scale + centerY + (random() - 0.5) * jit
    out[i * 3 + 2] = (random() - 0.5) * depth
  }
  return out
}

/**
 * The art's outer silhouette in world units: for every pixel column the lowest
 * lit pixel, for every pixel row the outermost lit pixel on each side. NaN
 * where a column or row is empty. Holes inside the art are invisible to it —
 * it is only what a trace coming in from outside would touch first.
 */
export interface Silhouette {
  /** world units per raster pixel */
  scale: number
  W: number
  H: number
  centerY: number
  /** per column, world Y of the lowest lit pixel */
  bottom: Float32Array
  /** per row (top first), world X of the leftmost / rightmost lit pixel */
  left: Float32Array
  right: Float32Array
  /** world extents of the lit pixels */
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function rasterSilhouette(raster: SvgRaster, opts: SvgPlacement): Silhouette | null {
  const { worldHeight, centerY, threshold = 100 } = opts
  const { data, W, H } = raster
  const scale = worldHeight / H
  const wx = (px: number) => (px + 0.5 - W / 2) * scale
  const wy = (py: number) => (H / 2 - py - 0.5) * scale + centerY

  const bottom = new Float32Array(W).fill(NaN)
  const left = new Float32Array(H).fill(NaN)
  const right = new Float32Array(H).fill(NaN)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] <= threshold) continue
      const X = wx(x)
      const Y = wy(y)
      bottom[x] = Y // rows scan top-down, so the last hit is the lowest
      if (Number.isNaN(left[y])) left[y] = X
      right[y] = X
      if (X < minX) minX = X
      if (X > maxX) maxX = X
      if (Y < minY) minY = Y
      if (Y > maxY) maxY = Y
    }
  }

  if (!Number.isFinite(minX)) return null
  return { scale, W, H, centerY, bottom, left, right, minX, maxX, minY, maxY }
}
