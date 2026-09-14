/**
 * Subset the Aeonik faces the CSS actually declares (@font-face in
 * src/styles/global.css) from the licensed .otf sources down to small .woff2
 * files carrying only the glyphs this site renders.
 *
 * The .otf originals stay untracked (see .gitignore); the .woff2 output IS
 * committed, so a Vercel build from Git ships the real typeface instead of
 * silently falling back to system-ui.
 *
 *   pnpm fonts
 */
import { readFile, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import subsetFont from 'subset-font'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'fonts')

/** The five weights declared in global.css — nothing else is converted. */
const FACES = ['Thin', 'Light', 'Regular', 'Medium', 'Bold']

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('')

/**
 * Glyph coverage, kept deliberately tight (~23 KB per face):
 * printable ASCII, every accented letter Spanish and Portuguese need
 * (áéíóúüñ¿¡ãõçâêô and their uppercase, plus the neighbouring Romance
 * accents), the typographic punctuation and symbols the copy uses,
 * subscript digits for CO₂, and the arrows drawn in the CTAs and schematics.
 */
const CHARS =
  range(0x20, 0x7e) + // ASCII
  'àáâãäçèéêëíîïñòóôõöúûüÀÁÂÃÄÇÈÉÊËÍÎÏÑÒÓÔÕÖÚÛÜ' +
  '¡¿ª°º·©²³×«»' +
  range(0x2080, 0x2089) + // subscript digits (CO₂)
  '–—‘’“”•…‹›' + // – — ‘ ’ “ ” • … ‹ ›
  '←↑→↓−─' // ← ↑ → ↓ − ─

const kb = (n) => `${(n / 1024).toFixed(1)} KB`

let missing = 0
for (const face of FACES) {
  const src = join(dir, `Aeonik-${face}.otf`)
  const out = join(dir, `Aeonik-${face}.woff2`)
  try {
    await access(src)
  } catch {
    console.warn(`! Aeonik-${face}.otf not found in public/fonts — skipped`)
    missing++
    continue
  }
  const input = await readFile(src)
  const subset = await subsetFont(input, CHARS, { targetFormat: 'woff2' })
  await writeFile(out, subset)
  console.log(`Aeonik-${face}: ${kb(input.length)} → ${kb(subset.length)} woff2`)
}

if (missing) {
  console.error(
    `\n${missing} source face(s) missing. The licensed .otf files are not in the repo — ` +
      'drop them into public/fonts/ and re-run `pnpm fonts`.',
  )
  process.exitCode = 1
}
