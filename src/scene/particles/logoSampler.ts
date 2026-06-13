import { createRandom } from '../../lib/random'

/**
 * Rasterizes the brand mark (public/logo.svg) to an offscreen canvas and
 * samples its filled pixels into world-space particle targets on a plane at
 * z≈0, centered slightly above the scene's focal height. The SVG's own fill
 * color is irrelevant — particles are colored copper by the shader.
 */

const MARK_CENTER_Y = 2.9
const MARK_WORLD_HEIGHT = 3.2

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function sampleLogoPoints(count: number): Promise<Float32Array> {
  const random = createRandom(20260612)
  const out = new Float32Array(count * 3)

  let candidates: number[] = []
  let W = 0
  let H = 0
  try {
    const img = await loadImage('/logo.svg')
    const aspect =
      img.naturalWidth > 0 && img.naturalHeight > 0
        ? img.naturalWidth / img.naturalHeight
        : 86.56 / 83.22
    H = 820
    W = Math.round(H * aspect)
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, 0, 0, W, H)
    const data = ctx.getImageData(0, 0, W, H).data
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (data[(y * W + x) * 4 + 3] > 120) candidates.push(x, y)
      }
    }
  } catch {
    candidates = []
  }

  const n = candidates.length / 2

  if (n === 0) {
    // degenerate fallback: a halo ring
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2
      out[i * 3] = Math.cos(a) * 2.2
      out[i * 3 + 1] = MARK_CENTER_Y + Math.sin(a) * 2.2
      out[i * 3 + 2] = (random() - 0.5) * 0.1
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

  const scale = MARK_WORLD_HEIGHT / H
  for (let i = 0; i < count; i++) {
    const c = order[i % n] * 2
    out[i * 3] = (candidates[c] - W / 2) * scale + (random() - 0.5) * 0.025
    out[i * 3 + 1] = (H / 2 - candidates[c + 1]) * scale + MARK_CENTER_Y + (random() - 0.5) * 0.025
    out[i * 3 + 2] = (random() - 0.5) * 0.07
  }
  return out
}
