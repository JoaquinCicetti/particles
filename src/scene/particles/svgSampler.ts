import { createRandom } from '../../lib/random'

/**
 * Rasterizes an SVG to an offscreen canvas and samples its lit pixels into
 * world-space particle targets on a plane at z≈0. Used for both the brand
 * mark and the industrial board "electronic" formation. The SVG's own colors
 * are irrelevant — particles are recolored copper by the shader.
 */

export interface SvgSampleOptions {
  /** target world height the rasterized art maps to */
  worldHeight: number
  /** world-space Y the art is centered on */
  centerY: number
  /** raster resolution (taller = finer sampling of thin strokes) */
  rasterHeight?: number
  /** pixel step when scanning (1 = densest, 2 = default) */
  step?: number
  /** alpha cutoff for a pixel to count as "lit" */
  threshold?: number
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

export async function sampleSvgPoints(
  url: string,
  count: number,
  opts: SvgSampleOptions,
): Promise<Float32Array> {
  const {
    worldHeight,
    centerY,
    rasterHeight = 900,
    step = 2,
    threshold = 100,
    depth = 0.08,
    seed = 20260613,
  } = opts

  const random = createRandom(seed)
  const out = new Float32Array(count * 3)

  let candidates: number[] = []
  let W = 0
  let H = 0
  try {
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
    const aspect = vbW / vbH
    H = rasterHeight
    W = Math.round(H * aspect)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0, W, H)
    const data = ctx.getImageData(0, 0, W, H).data
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > threshold) candidates.push(x, y)
      }
    }
  } catch {
    candidates = []
  }

  const n = candidates.length / 2
  const scale = worldHeight / H

  if (n === 0) {
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
