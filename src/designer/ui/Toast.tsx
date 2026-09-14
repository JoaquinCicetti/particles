import { useEffect, useState } from 'react'
import { useUi } from '../store'

export default function Toast() {
  const toast = useUi((s) => s.toast)
  const [gone, setGone] = useState<number | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setGone(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast || gone === toast.id) return null
  return (
    <div className="dz-toast" role="status" key={toast.id}>
      {toast.text}
    </div>
  )
}
