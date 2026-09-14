import { useState } from 'react'
import { useIntl } from 'react-intl'
import { D } from '../i18n/messages'

type Props = { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }

/** − [n] + integer control for counts (outputs, quantities). */
export default function Stepper({ value, onChange, min = 0, max = 999, label }: Props) {
  const intl = useIntl()
  const [draft, setDraft] = useState<string | null>(null)
  const put = (v: number) => {
    const n = Math.round(Math.min(max, Math.max(min, v)))
    if (n !== value) onChange(n)
    return n
  }
  return (
    <div className="dz-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => put(value - 1)} disabled={value <= min} aria-label={intl.formatMessage(D.decrease)}>
        −
      </button>
      <input
        inputMode="numeric"
        aria-label={label}
        value={draft ?? String(value)}
        onFocus={(e) => {
          setDraft(String(value))
          e.currentTarget.select()
        }}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={() => {
          if (draft) put(Number(draft))
          setDraft(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            setDraft(String(put(value + (e.key === 'ArrowUp' ? 1 : -1))))
          }
        }}
      />
      <button type="button" onClick={() => put(value + 1)} disabled={value >= max} aria-label={intl.formatMessage(D.increase)}>
        +
      </button>
    </div>
  )
}
