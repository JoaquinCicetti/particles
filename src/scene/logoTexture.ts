import * as THREE from 'three'

/**
 * Rasterizes /logo.svg into a flat, solid, single-colour texture with alpha.
 *
 * The mark on the enclosure door has to read as printed-on: solid shapes, one
 * ink, no stipple and no glow. Sampling it into particles (as the finale does)
 * gives a dotted mark, and additive blending makes it a lamp — so instead the
 * SVG is drawn to a canvas and its own colour is replaced with a flat ink via
 * `source-in`, leaving only the silhouette's alpha. Used with an unlit
 * MeshBasicMaterial, nothing about it can light up.
 */
export async function loadLogoTexture(ink: string, height = 512) {
  const text = await fetch('/logo.svg').then((r) => r.text())

  // SVGs sized only by viewBox rasterize empty as an <img>, so force explicit
  // width/height first (same fix the particle sampler needs)
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

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized)
  })

  const H = height
  const W = Math.max(1, Math.round(H * (vbW / vbH)))
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, W, H)
  // keep the silhouette, throw away the artwork's own colour
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, W, H)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return { tex, aspect: vbW / vbH }
}
