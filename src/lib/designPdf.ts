import { jsPDF } from 'jspdf'
import { COMPANY } from '@/data/brand'

export type DesignPdfMeta = {
  title: string
  color?: string
  size?: string
  quantity?: number
  price?: number
  notes?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
}

/**
 * Generate an A4 PDF containing the customer's custom design preview plus order metadata.
 * Returns the jsPDF instance so the caller can save() / output() as needed.
 *
 * NOTE: WhatsApp `wa.me` deep links cannot attach files. To deliver the design
 * we trigger a browser download of this PDF, and the WhatsApp text message
 * instructs the customer to attach the just-downloaded file to the chat.
 */
export function buildDesignPdf(imageDataUrl: string, meta: DesignPdfMeta): jsPDF {
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  })

  const pageW = pdf.internal.pageSize.getWidth() // 210mm
  const pageH = pdf.internal.pageSize.getHeight() // 297mm

  // Header band
  pdf.setFillColor(14, 165, 233) // sky-500 brand
  pdf.rect(0, 0, pageW, 24, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(COMPANY.shortName, 12, 12)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text('Custom T-Shirt Design Order Sheet', 12, 18)

  pdf.setFontSize(9)
  pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW - 12, 18, { align: 'right' })

  pdf.setTextColor(15, 23, 42)

  // Design preview area (centered, max 160mm wide, keep aspect 4:5)
  if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
    const imgW = 140
    const imgH = 175
    const imgX = (pageW - imgW) / 2
    const imgY = 36
    pdf.setDrawColor(226, 232, 240)
    pdf.setLineWidth(0.4)
    pdf.roundedRect(imgX - 3, imgY - 3, imgW + 6, imgH + 6, 4, 4, 'S')
    const fmt: 'PNG' | 'JPEG' = imageDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try {
      pdf.addImage(imageDataUrl, fmt, imgX, imgY, imgW, imgH, undefined, 'FAST')
    } catch {
      // If addImage fails (rare CORS / format issue) just skip — meta still printed below.
    }
  }

  // Two-column meta block: Order details (left) + Customer details (right)
  const metaY = 220
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Order Details', 18, metaY)
  pdf.text('Customer', pageW / 2 + 4, metaY)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  const rows: Array<[string, string]> = [
    ['Product', meta.title],
    ['Color', meta.color ?? '—'],
    ['Size', meta.size ?? '—'],
    ['Quantity', String(meta.quantity ?? 1)],
    ['Unit price', meta.price ? `Rs. ${meta.price}` : '—'],
    ['Total', meta.price ? `Rs. ${(meta.price * (meta.quantity ?? 1)).toLocaleString('en-IN')}` : '—'],
  ]
  rows.forEach((r, i) => {
    const y = metaY + 8 + i * 7
    pdf.setTextColor(100, 116, 139)
    pdf.text(r[0], 18, y)
    pdf.setTextColor(15, 23, 42)
    pdf.text(r[1], 50, y)
  })

  let customerCy = metaY + 8
  const custLabelX = pageW / 2 + 4
  const custValueX = pageW / 2 + 26
  const custValueMaxW = pageW / 2 - 42
  const simpleRows: Array<[string, string]> = [
    ['Name', meta.customerName || '—'],
    ['Phone', meta.customerPhone || '—'],
    ['Email', meta.customerEmail || '—'],
  ]
  simpleRows.forEach((r) => {
    pdf.setTextColor(100, 116, 139)
    pdf.text(r[0], custLabelX, customerCy)
    pdf.setTextColor(15, 23, 42)
    pdf.text(r[1], custValueX, customerCy, { maxWidth: custValueMaxW })
    customerCy += 7
  })
  pdf.setTextColor(100, 116, 139)
  pdf.text('Address', custLabelX, customerCy)
  pdf.setTextColor(15, 23, 42)
  const addrVal = meta.customerAddress?.trim() || '—'
  const addrLines =
    addrVal === '—' ? ['—'] : pdf.splitTextToSize(addrVal, custValueMaxW)
  addrLines.forEach((line, li) => {
    pdf.text(line, custValueX, customerCy + li * 5)
  })
  customerCy += Math.max(7, addrLines.length * 5)

  const leftColBottom = metaY + 8 + rows.length * 7
  const metaNotesY = Math.max(leftColBottom, customerCy) + 6

  if (meta.notes) {
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.text(`Notes: ${meta.notes}`, 18, metaNotesY, { maxWidth: pageW - 36 })
  }

  // Footer
  pdf.setDrawColor(226, 232, 240)
  pdf.line(12, pageH - 18, pageW - 12, pageH - 18)
  pdf.setTextColor(100, 116, 139)
  pdf.setFontSize(8)
  pdf.text(
    `${COMPANY.name}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}`,
    pageW / 2,
    pageH - 11,
    { align: 'center' },
  )
  pdf.text(COMPANY.siteUrl.replace(/^https?:\/\//, ''), pageW / 2, pageH - 6, { align: 'center' })

  return pdf
}

export type DesignPdfResult = {
  fileName: string
  /** Full PDF as a `data:application/pdf;base64,...` URL — safe to persist & re-open. */
  dataUrl: string
}

/**
 * Build PDF, trigger a browser download AND return its data URL so it can be
 * stored on the admin upload record for later viewing.
 */
export function downloadDesignPdf(imageDataUrl: string, meta: DesignPdfMeta): DesignPdfResult {
  const safe = meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'design'
  const fileName = `aasha-sm-${safe}-${Date.now()}.pdf`
  const pdf = buildDesignPdf(imageDataUrl, meta)
  pdf.save(fileName)
  let dataUrl = ''
  try {
    dataUrl = pdf.output('datauristring')
  } catch {
    dataUrl = ''
  }
  return { fileName, dataUrl }
}

// ── Cart / order-summary PDF ───────────────────────────────────────────────

export type CartPdfItem = {
  title: string
  qty: number
  price: number
  size?: string
  color?: string
  previewImage?: string
  slug?: string
}

export type CartPdfMeta = {
  subtotal: number
  discount?: number
  discountLabel?: string
  shipping?: number
  total: number
  orderRef?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
}

/**
 * Build a multi-page A4 PDF summarizing every cart item.
 * Each line shows the design thumbnail (for custom items), title, qty × price,
 * subtotal. Last page (or last block) shows totals.
 */
export function buildCartPdf(items: CartPdfItem[], meta: CartPdfMeta): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 14
  const usableW = pageW - margin * 2

  function header() {
    pdf.setFillColor(14, 165, 233)
    pdf.rect(0, 0, pageW, 24, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.text(COMPANY.shortName, margin, 12)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('Order Summary / Quote', margin, 18)
    pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW - margin, 18, {
      align: 'right',
    })
    pdf.setTextColor(15, 23, 42)
  }

  function footer() {
    pdf.setDrawColor(226, 232, 240)
    pdf.line(margin, pageH - 18, pageW - margin, pageH - 18)
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(8)
    pdf.text(
      `${COMPANY.name}  ·  ${COMPANY.phone}  ·  ${COMPANY.email}`,
      pageW / 2,
      pageH - 11,
      { align: 'center' },
    )
    pdf.text(COMPANY.siteUrl.replace(/^https?:\/\//, ''), pageW / 2, pageH - 6, {
      align: 'center',
    })
  }

  header()

  let y = 32
  if (meta.orderRef) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(`Order ref: ${meta.orderRef}`, margin, y)
    y += 6
  }

  const hasCust =
    meta.customerName?.trim() ||
    meta.customerPhone?.trim() ||
    meta.customerEmail?.trim() ||
    meta.customerAddress?.trim()
  if (hasCust) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('Delivery / contact', margin, y)
    y += 6
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const linesCust: Array<[string, string]> = []
    if (meta.customerName?.trim()) linesCust.push(['Name', meta.customerName.trim()])
    if (meta.customerPhone?.trim()) linesCust.push(['Phone', meta.customerPhone.trim()])
    if (meta.customerEmail?.trim()) linesCust.push(['Email', meta.customerEmail.trim()])
    if (meta.customerAddress?.trim()) {
      const wrapped = pdf.splitTextToSize(meta.customerAddress.trim(), usableW - 24)
      linesCust.push(['Address', wrapped.join('\n')])
    }
    for (const [label, text] of linesCust) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text(`${label}:`, margin, y)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(10)
      const parts = text.split('\n')
      let lineY = y
      parts.forEach((part, idx) => {
        pdf.text(part, margin + 28, lineY)
        if (idx < parts.length - 1) lineY += 5
      })
      y = lineY + 6
    }
    y += 2
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Items', margin, y + 4)
  y += 10

  // Column header row
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(100, 116, 139)
  pdf.text('Product', margin + 26, y)
  pdf.text('Qty', pageW - margin - 50, y, { align: 'right' })
  pdf.text('Unit', pageW - margin - 28, y, { align: 'right' })
  pdf.text('Total', pageW - margin, y, { align: 'right' })
  pdf.setTextColor(15, 23, 42)
  pdf.setDrawColor(226, 232, 240)
  pdf.line(margin, y + 2, pageW - margin, y + 2)
  y += 8

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  items.forEach((it) => {
    const rowH = 22
    if (y + rowH > pageH - 60) {
      footer()
      pdf.addPage()
      header()
      y = 32
    }

    const thumbX = margin
    const thumbY = y - 4
    const thumbS = 20
    if (it.previewImage && it.previewImage.startsWith('data:image/')) {
      const fmt: 'PNG' | 'JPEG' = it.previewImage.startsWith('data:image/png')
        ? 'PNG'
        : 'JPEG'
      try {
        pdf.addImage(it.previewImage, fmt, thumbX, thumbY, thumbS, thumbS, undefined, 'FAST')
      } catch {
        pdf.setDrawColor(226, 232, 240)
        pdf.roundedRect(thumbX, thumbY, thumbS, thumbS, 2, 2, 'S')
      }
    } else {
      pdf.setFillColor(241, 245, 249)
      pdf.roundedRect(thumbX, thumbY, thumbS, thumbS, 2, 2, 'F')
      pdf.setTextColor(148, 163, 184)
      pdf.setFontSize(7)
      pdf.text('TEE', thumbX + thumbS / 2, thumbY + thumbS / 2 + 1, { align: 'center' })
      pdf.setFontSize(10)
      pdf.setTextColor(15, 23, 42)
    }

    const titleX = margin + 26
    pdf.setFont('helvetica', 'bold')
    const titleLines = pdf.splitTextToSize(it.title, usableW - 26 - 60)
    pdf.text(titleLines.slice(0, 2), titleX, y + 2)

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    const extras = [it.size && `Size ${it.size}`, it.color && it.color].filter(Boolean).join(' · ')
    if (extras) pdf.text(extras, titleX, y + 8)
    if (it.slug) {
      const link = `${COMPANY.siteUrl.replace(/\/$/, '')}/shop/${it.slug}`
      pdf.setTextColor(14, 165, 233)
      pdf.textWithLink(link, titleX, y + 13, { url: link })
      pdf.setTextColor(100, 116, 139)
    }
    if (it.previewImage) {
      pdf.setTextColor(16, 185, 129)
      pdf.setFontSize(8)
      pdf.text('Custom design', titleX, y + 17)
      pdf.setTextColor(100, 116, 139)
    }

    pdf.setTextColor(15, 23, 42)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.text(String(it.qty), pageW - margin - 50, y + 2, { align: 'right' })
    pdf.text(`Rs. ${it.price}`, pageW - margin - 28, y + 2, { align: 'right' })
    pdf.setFont('helvetica', 'bold')
    pdf.text(
      `Rs. ${(it.qty * it.price).toLocaleString('en-IN')}`,
      pageW - margin,
      y + 2,
      { align: 'right' },
    )
    pdf.setFont('helvetica', 'normal')

    y += rowH
    pdf.setDrawColor(241, 245, 249)
    pdf.line(margin, y - 4, pageW - margin, y - 4)
  })

  // Totals box
  if (y + 40 > pageH - 30) {
    footer()
    pdf.addPage()
    header()
    y = 32
  }
  y += 4
  const boxX = pageW - margin - 80
  const boxW = 80
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(boxX, y, boxW, 36, 3, 3, 'S')

  const writeRow = (label: string, val: string, dy: number, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    pdf.setFontSize(bold ? 12 : 10)
    pdf.setTextColor(bold ? 15 : 100, bold ? 23 : 116, bold ? 42 : 139)
    pdf.text(label, boxX + 4, y + dy)
    pdf.setTextColor(15, 23, 42)
    pdf.text(val, boxX + boxW - 4, y + dy, { align: 'right' })
  }
  writeRow('Subtotal', `Rs. ${meta.subtotal.toLocaleString('en-IN')}`, 8)
  let dy = 14
  if (meta.discount && meta.discount > 0) {
    writeRow(meta.discountLabel || 'Discount', `- Rs. ${meta.discount.toLocaleString('en-IN')}`, dy)
    dy += 6
  }
  if (meta.shipping !== undefined) {
    writeRow(
      'Shipping',
      meta.shipping === 0 ? 'Free' : `Rs. ${meta.shipping.toLocaleString('en-IN')}`,
      dy,
    )
    dy += 6
  }
  pdf.setDrawColor(226, 232, 240)
  pdf.line(boxX + 4, y + dy, boxX + boxW - 4, y + dy)
  writeRow('Total', `Rs. ${meta.total.toLocaleString('en-IN')}`, dy + 6, true)

  footer()
  return pdf
}

/** Build cart PDF and trigger download. Returns the filename used. */
export function downloadCartPdf(items: CartPdfItem[], meta: CartPdfMeta): string {
  const ref = meta.orderRef || `cart-${Date.now()}`
  const fileName = `aasha-sm-${ref}.pdf`
  const pdf = buildCartPdf(items, meta)
  pdf.save(fileName)
  return fileName
}
