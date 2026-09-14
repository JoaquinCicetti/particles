// Growcast WhatsApp line (Rosario, +54 9 341 …): the meeting dialog and the designer hand-off
export const WHATSAPP = '5493412753179'

// the line printed in the contact section, as a plain wa.me link
export const WHATSAPP_FOOTER = '5493412796894'

/** wa.me link to a line (the main one by default), optionally with a prefilled message */
export const whatsappUrl = (text?: string, line = WHATSAPP) =>
  `https://wa.me/${line}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** The footer line, formatted for reading: +54 9 341 279 6894 */
export const WHATSAPP_FOOTER_DISPLAY = WHATSAPP_FOOTER.replace(
  /^(\d{2})(\d)(\d{3})(\d{3})(\d{4})$/,
  '+$1 $2 $3 $4 $5',
)

// sales inbox
export const EMAIL = 'ventas@growcast.io'

// the inbox the terms and privacy policy name for claims, data and revocations
export const LEGAL_EMAIL = 'info@growcast.io'

// the Growcast platform
export const APP_URL = 'https://app.growcast.io'
