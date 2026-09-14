// Growcast WhatsApp line (Rosario, +54 9 341 …)
export const WHATSAPP = '5493412753179'

/** wa.me link to the line, optionally with a prefilled message */
export const whatsappUrl = (text?: string) =>
  `https://wa.me/${WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** The same line, formatted for reading: +54 9 341 275 3179 */
export const WHATSAPP_DISPLAY = WHATSAPP.replace(
  /^(\d{2})(\d)(\d{3})(\d{3})(\d{4})$/,
  '+$1 $2 $3 $4 $5',
)

// sales inbox
export const EMAIL = 'ventas@growcast.io'
