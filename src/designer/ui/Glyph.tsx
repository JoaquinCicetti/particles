import { GLYPHS, type GlyphKey } from './glyphs'

export default function Glyph({ name, className = 'dz-glyph' }: { name: GlyphKey; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d={GLYPHS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
