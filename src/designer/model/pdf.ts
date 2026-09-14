/**
 * A one-page PDF holding a single JPEG, written by hand — the snapshot needs
 * nothing more, and a PDF library would be most of the designer's weight.
 * The page is A4-landscape wide (842 pt) and as tall as the image's aspect.
 */
export function jpegPdf(jpeg: Uint8Array, width: number, height: number): Blob {
  const pageW = 842
  const pageH = Math.round(((pageW * height) / width) * 100) / 100
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const offsets: number[] = []
  let length = 0
  const push = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk
    parts.push(bytes)
    length += bytes.length
  }
  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`

  push('%PDF-1.4\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  ]
  objects.forEach((body, i) => {
    offsets.push(length)
    push(`${i + 1} 0 obj\n${body}\nendobj\n`)
  })
  offsets.push(length)
  push(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  )
  push(jpeg)
  push('\nendstream\nendobj\n')
  offsets.push(length)
  push(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`)

  const xref = length
  push(
    `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n` +
      offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('') +
      `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
  )
  return new Blob(parts as BlobPart[], { type: 'application/pdf' })
}
