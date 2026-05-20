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
  /** Width ÷ height of the print-area crop (page 2 fit). */
  printAspectRatio?: number
}

/**
 * Two-page A4 PDF:
 * - Page 1: structured order + client + design notes (no artwork).
 * - Page 2: artwork only, scaled to printable area (for production / screen print).
 *
 * WhatsApp cannot attach files from `wa.me`; we download this PDF for the customer to forward.
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

  const margin = 12
  const innerW = pageW - 2 * margin
  const labelCol = margin + 4
  const valueX = margin + 44
  const valueMaxW = pageW - valueX - margin - 4

  const orderRows: Array<[string, string]> = [
    ['Product', meta.title],
    ['T-shirt colour', meta.color ?? '—'],
    ['Size', meta.size ?? '—'],
    ['Quantity', String(meta.quantity ?? 1)],
    ['Unit price', meta.price ? `₹ ${meta.price.toLocaleString('en-IN')}` : '—'],
    ['Line total', meta.price ? `₹ ${(meta.price * (meta.quantity ?? 1)).toLocaleString('en-IN')}` : '—'],
  ]
  const clientPairs: Array<[string, string]> = [
    ['Full name', meta.customerName || '—'],
    ['Phone / WhatsApp', meta.customerPhone || '—'],
    ['Email', meta.customerEmail || '—'],
    ['Delivery address', meta.customerAddress?.trim() || '—'],
  ]

  function drawPanel(yTop: number, heightMm: number) {
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(203, 213, 225)
    pdf.setLineWidth(0.35)
    pdf.roundedRect(margin, yTop, innerW, heightMm, 2, 2, 'FD')
  }

  /** Total vertical space for labelled rows when drawn at arbitrary Y. */
  function pairsTotalHeight(pairs: Array<[string, string]>): number {
    let sum = 0
    pairs.forEach(([, val]) => {
      const lines = pdf.splitTextToSize(val || '—', valueMaxW)
      sum += Math.max(5.2, lines.length * 4.6)
    })
    return sum
  }

  function paintSectionHeading(yStart: number, title: string, subtitleLines: string[] | null) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10.5)
    pdf.setTextColor(51, 65, 85)
    pdf.text(title, margin + 4, yStart)

    let y = yStart + 6
    if (subtitleLines?.length) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7.5)
      pdf.setTextColor(100, 116, 139)
      subtitleLines.forEach((ln) => {
        pdf.text(ln, margin + 4, y, { maxWidth: innerW - 8 })
        y += 3.7
      })
    }
    return y + 3
  }

  function paintKeyValueRows(yStart: number, pairs: Array<[string, string]>): number {
    let cy = yStart
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pairs.forEach(([label, val]) => {
      pdf.setTextColor(100, 116, 139)
      pdf.text(label, labelCol, cy)
      pdf.setTextColor(15, 23, 42)
      const lines = pdf.splitTextToSize(val || '—', valueMaxW)
      lines.forEach((line, li) => {
        pdf.text(line, valueX, cy + li * 4.6)
      })
      cy += Math.max(5.2, lines.length * 4.6)
    })
    return cy
  }

  const hasNotes = Boolean(meta.notes?.trim())
  const noteLines = hasNotes ? pdf.splitTextToSize(meta.notes!.trim(), innerW - 8) : []

  /** First key/value baseline offset from panel top — must match `paintSectionHeading(panel + 6, …, null)`. */
  const PANEL_TO_FIRST_KV_ROW = 15
  const PANEL_BOTTOM_PAD = 9

  /** Row block for stacked panels */
  function blockHeight(kvPairs: Array<[string, string]>): number {
    return PANEL_TO_FIRST_KV_ROW + pairsTotalHeight(kvPairs) + PANEL_BOTTOM_PAD
  }

  function blockHeightNotes(): number {
    if (!hasNotes) return 0
    return PANEL_TO_FIRST_KV_ROW + noteLines.length * 4 + PANEL_BOTTOM_PAD
  }

  // ── PAGE 1: order + customer + notes (no tee mockup — avoids layout clashes) ─
  let y = 28
  const gap = 6

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139)
  pdf.text('PAGE 1 — ORDER & CONTACT (keep for reference)', margin, y)
  y += 6

  const bH = blockHeight(orderRows)
  drawPanel(y, bH)
  const rowsBStart = paintSectionHeading(y + 6, 'ORDER & PRODUCT DETAILS', null)
  paintKeyValueRows(rowsBStart, orderRows)
  y += bH + gap

  const cH = blockHeight(clientPairs)
  drawPanel(y, cH)
  const rowsCStart = paintSectionHeading(y + 6, 'CLIENT / DELIVERY DETAILS', null)
  paintKeyValueRows(rowsCStart, clientPairs)
  y += cH + gap

  if (hasNotes) {
    const dH = blockHeightNotes()
    drawPanel(y, dH)
    let ny = paintSectionHeading(y + 6, 'DESIGN NOTES', null)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(15, 23, 42)
    noteLines.forEach((line) => {
      pdf.text(line, margin + 4, ny)
      ny += 4
    })
  }

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

  // ── PAGE 2: flat artwork only (scaled to A4 printable area) ─────────────
  if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
    const fmt: 'PNG' | 'JPEG' = imageDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    pdf.addPage()
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageW, pageH, 'F')

    const printPad = 10
    const maxW = pageW - printPad * 2
    const maxH = pageH - printPad * 2
    const ar = meta.printAspectRatio
    const designAspect =
      typeof ar === 'number' && ar > 0.05 && ar < 20 ? ar : 560 / 700
    let dw = maxW
    let dh = dw / designAspect
    if (dh > maxH) {
      dh = maxH
      dw = dh * designAspect
    }
    const ix = (pageW - dw) / 2
    const iy = (pageH - dh) / 2
    try {
      pdf.addImage(imageDataUrl, fmt, ix, iy, dw, dh, undefined, 'FAST')
    } catch {
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(11)
      pdf.setTextColor(148, 163, 184)
      pdf.text('Artwork could not be placed on page 2.', printPad, 40)
    }
  }

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
      parts.forEach((part) => {
        pdf.text(part, margin + 28, lineY, { maxWidth: usableW - 32 })
        lineY += 5
      })
      y = lineY + 4
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
