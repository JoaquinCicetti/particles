import type { ReactNode } from 'react'

type Option<T extends string> = { value: T; label: ReactNode; title?: string }

export default function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T | null
  options: ReadonlyArray<Option<T>>
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="dz-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'is-on' : undefined}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
