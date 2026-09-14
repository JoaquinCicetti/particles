import { useRef, useState } from 'react'

type Props = {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  decimals?: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const parse = (s: string) => Number(s.trim().replace(',', '.'))

/**
 * Numeric input that edits a draft and commits on blur / Enter (Esc reverts).
 * ↑/↓ step by `step`, Shift ×10. Accepts a decimal comma.
 */
export default function NumberField({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 0.1,
  unit = 'm',
  decimals = 2,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const skip = useRef(false)
  const show = (v: number) => v.toFixed(decimals)
  const round = (v: number) => Number(v.toFixed(decimals))

  const commit = (raw: string) => {
    setDraft(null)
    if (skip.current) {
      skip.current = false
      return
    }
    const v = parse(raw)
    if (raw.trim() === '' || !Number.isFinite(v)) return
    const next = round(clamp(v, min, max))
    if (next !== value) onChange(next)
  }

  const bump = (dir: 1 | -1, big: boolean) => {
    const typed = draft === null ? NaN : parse(draft)
    const base = Number.isFinite(typed) ? typed : value
    const next = round(clamp(base + dir * step * (big ? 10 : 1), min, max))
    setDraft(show(next))
    if (next !== value) onChange(next)
  }

  return (
    <label className="dz-num">
      <span className="dz-num-label">{label}</span>
      <span className="dz-num-box">
        <input
          type="text"
          inputMode="decimal"
          spellCheck={false}
          autoComplete="off"
          value={draft ?? show(value)}
          onFocus={(e) => {
            setDraft(show(value))
            e.currentTarget.select()
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            else if (e.key === 'Escape') {
              skip.current = true
              e.currentTarget.blur()
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
              bump(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey)
            }
          }}
        />
        {unit && <span className="dz-num-unit">{unit}</span>}
      </span>
    </label>
  )
}
