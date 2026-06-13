// One-shot: convert the themed React board component into a clean standalone
// SVG that can be rasterized for particle sampling. Color is irrelevant (the
// shader recolors to copper) — we only need the geometry to render: `.line`
// becomes circuit traces (stroke), filled classes become component bodies.
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/AnimatedGrowcastIndustryWithControlAndExpander.tsx'
const OUT = 'public/industrial-board.svg'

let src = readFileSync(SRC, 'utf8')

// 1. isolate the <svg> … </svg> block
const start = src.indexOf('<svg')
const end = src.lastIndexOf('</svg>') + '</svg>'.length
let svg = src.slice(start, end)

// 2. strip JSX comments {/* … */}
svg = svg.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// 3. drop embedded raster photos — we want vector board geometry only
svg = svg.replace(/<image\b[\s\S]*?\/>/g, '')

// 3b. the photos were wrapped in JSX conditionals {cond && ( … )} — now
//     empty; remove the wrappers (their `&&` is invalid XML otherwise)
svg = svg.replace(/\{[^{}]*&&\s*\([\s\S]*?\)\s*\}/g, '')

// 4. replace the themed stylesheet with a flat high-contrast one
const style = [
  '.line{fill:none;stroke:#fff;stroke-width:2}',
  '.color{fill:#fff}',
  '.alternativeColor{fill:#dcdcdc}',
  '.mixBlendModeMultiply{fill:#fff}',
  '.mixBlendModeScreen{fill:#fff}',
  '.led{fill:#fff}',
].join('')
svg = svg.replace(/\{buildCommonSVGStyles\(\)\}/, style)

// 5. JSX-specific attribute fixes (dynamic LED/control-module exprs → static).
//    [^}] matches newlines, so multiline ternaries collapse too.
svg = svg
  .replace(/className=\{[^}]*\}/g, 'class="led"')
  .replace(/fill=\{[^}]*\}/g, 'fill="#fff"')
  .replace(/className=/g, 'class=')
  .replace(/xmlnsXlink=/g, 'xmlns:xlink=')
  .replace(/xlinkHref=/g, 'xlink:href=')

// 6. JS style objects → CSS strings (only transform translate() in this file)
svg = svg.replace(
  /style=\{\{\s*transform:\s*"([^"]*)"\s*\}\}/g,
  'style="transform:$1"',
)

// 7. numeric JSX attributes  attr={123.4}  →  attr="123.4"
svg = svg.replace(/=\{(-?[\d.]+)\}/g, '="$1"')

// safety: any leftover {…} attribute would be invalid XML
const leftover = svg.match(/=\{[^}]*\}/g)
if (leftover) {
  console.error('Unconverted JSX expressions remain:', [...new Set(leftover)].slice(0, 10))
  process.exit(1)
}

writeFileSync(OUT, svg)
console.log(`wrote ${OUT} (${svg.length} bytes)`)
