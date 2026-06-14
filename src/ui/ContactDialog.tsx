import { useEffect, useRef, useState } from 'react'

// Growcast Agro WhatsApp line (Rosario, +54 9 341 …)
const WHATSAPP = '5493412753179'
const DEFAULT_MSG = 'Hola Growcast, me gustaría coordinar una reunión para conocer la plataforma.'

export default function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState(DEFAULT_MSG)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const send = () => {
    const text = (name.trim() ? `Soy ${name.trim()}. ` : '') + msg.trim()
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Coordinar una reunión"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dialog-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <span className="kicker">COORDINEMOS</span>
        <h3 className="dialog-title">Hablemos de tu campo</h3>
        <p className="dialog-sub">
          Te respondemos por WhatsApp. Dejanos tu nombre y un mensaje y abrimos la conversación.
        </p>

        <label className="dialog-field">
          <span>Nombre</span>
          <input
            ref={firstRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre o establecimiento"
          />
        </label>

        <label className="dialog-field">
          <span>Mensaje</span>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
        </label>

        <button type="button" className="cta dialog-send" onClick={send}>
          Enviar por WhatsApp
        </button>
      </div>
    </div>
  )
}
