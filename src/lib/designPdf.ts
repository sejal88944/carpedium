import { jsPDF } from 'jspdf'
import { readPrintArtworkForCartItem } from '@/lib/designArtworkExport'
import { pdfDataUri, savePdfFile, type DownloadResult } from '@/lib/downloadFile'
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
  printType?: string
  orderId?: string
  orderDate?: string
  /** Transparent or flat print artwork for page 2. */
  artworkDataUrl: string
  printWidthMm?: number
  printHeightMm?: number
  artworkWidthPx?: number
  artworkHeightPx?: number
  printAspectRatio?: number
  designText?: string
  /** T-shirt mockup for page 1 — where logo / text / emoji are placed. */
  mockupPreviewUrl?: string
}

const MOCKUP_ASPECT = 560 / 700

function embedImageInBox(
  pdf: jsPDF,
  dataUrl: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
): boolean {
  if (!dataUrl.startsWith('data:image/')) return false
  const fmt: 'PNG' | 'JPEG' = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
  let dw = maxW
  let dh = dw / MOCKUP_ASPECT
  if (dh > maxH) {
    dh = maxH
    dw = dh * MOCKUP_ASPECT
  }
  const ix = x + (maxW - dw) / 2
  try {
    pdf.addImage(dataUrl, fmt, ix, y, dw, dh, undefined, 'SLOW')
    return true
  } catch {
    return false
  }
}

/** Page 1 — DESIGN ON T-SHIRT mockup (cart / invoice). */
function drawMockupPlacementBlock(
  pdf: jsPDF,
  mockupUrl: string,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
): number {
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(203, 213, 225)
  pdf.roundedRect(x, y, boxW, boxH, 2, 2, 'FD')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(51, 65, 85)
  pdf.text('DESIGN ON T-SHIRT', x + boxW / 2, y + 8, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.text('Exact placement — logo, text & emoji', x + boxW / 2, y + 14, { align: 'center' })

  const pad = 6
  const imgMaxW = boxW - pad * 2
  const imgMaxH = boxH - 22
  embedImageInBox(pdf, mockupUrl, x + pad, y + 18, imgMaxW, imgMaxH)
  return y + boxH
}

function extractDesignTextFromTitle(title: string): string | undefined {
  const quoted = title.match(/[“"]([^”"]+)[”"]/)
  if (quoted?.[1]?.trim()) return quoted[1].trim()
  const afterDot = title.match(/·\s*(.+)$/)
  if (afterDot?.[1]?.trim() && !afterDot[1].startsWith('http')) return afterDot[1].trim()
  return undefined
}

function formatOrderDate(iso?: string) {
  if (iso) {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      /* fall through */
    }
  }
  return new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function drawInvoicePage(pdf: jsPDF, meta: DesignPdfMeta) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 14
  const innerW = pageW - margin * 2
  const labelX = margin + 2
  const valueX = margin + 48
  const valueMax = pageW - valueX - margin

  // Brand header
  pdf.setFillColor(14, 165, 233)
  pdf.rect(0, 0, pageW, 32, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(COMPANY.shortName, margin, 14)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(COMPANY.tagline, margin, 21)
  pdf.setFontSize(8)
  pdf.text(`${COMPANY.phone}  ·  ${COMPANY.email}`, pageW - margin, 14, { align: 'right' })
  pdf.text(COMPANY.siteUrl.replace(/^https?:\/\//, ''), pageW - margin, 20, { align: 'right' })

  pdf.setTextColor(15, 23, 42)
  let y = 42

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.text('ORDER INVOICE', margin, y)
  y += 10

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100, 116, 139)
  pdf.text('Custom T-Shirt Order — reference for production & delivery', margin, y)
  y += 12

  // Order meta strip
  pdf.setFillColor(241, 245, 249)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(margin, y, innerW, 22, 2, 2, 'FD')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(51, 65, 85)
  const orderId = meta.orderId || `ORD-${Date.now()}`
  pdf.text(`Order ID: ${orderId}`, margin + 4, y + 8)
  pdf.text(`Date: ${formatOrderDate(meta.orderDate)}`, margin + 4, y + 15)
  pdf.text(`Print type: ${meta.printType || 'Custom DTG / Screen'}`, pageW / 2 + 4, y + 8)
  y += 30

  function panel(title: string, rows: Array<[string, string]>, startY: number): number {
    let cy = startY + 12
    rows.forEach(([label, val]) => {
      const lines = pdf.splitTextToSize(val || '—', valueMax)
      cy += Math.max(6, lines.length * 4.8)
    })
    const blockH = cy - startY + 8

    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(margin, startY, innerW, blockH, 2, 2, 'FD')

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(51, 65, 85)
    pdf.text(title, margin + 4, startY + 7)

    cy = startY + 14
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    rows.forEach(([label, val]) => {
      pdf.setTextColor(100, 116, 139)
      pdf.text(label, labelX + 2, cy)
      pdf.setTextColor(15, 23, 42)
      const lines = pdf.splitTextToSize(val || '—', valueMax)
      lines.forEach((line, li) => {
        pdf.text(line, valueX, cy + li * 4.8)
      })
      cy += Math.max(6, lines.length * 4.8)
    })
    return startY + blockH + 8
  }

  const orderRows: Array<[string, string]> = [
    ['Product', meta.title],
    ['T-shirt colour', meta.color ?? '—'],
    ['Size', meta.size ?? '—'],
    ['Quantity', String(meta.quantity ?? 1)],
    ['Unit price', meta.price ? `₹ ${meta.price.toLocaleString('en-IN')}` : '—'],
    ['Line total', meta.price ? `₹ ${(meta.price * (meta.quantity ?? 1)).toLocaleString('en-IN')}` : '—'],
  ]
  y = panel('ORDER DETAILS', orderRows, y)

  const clientRows: Array<[string, string]> = [
    ['Full name', meta.customerName || '—'],
    ['Phone / WhatsApp', meta.customerPhone || '—'],
    ['Email', meta.customerEmail || '—'],
    ['Delivery address', meta.customerAddress?.trim() || '—'],
  ]
  y = panel('CUSTOMER DETAILS', clientRows, y)

  if (meta.mockupPreviewUrl?.startsWith('data:image/')) {
    const boxH = 88
    y = drawMockupPlacementBlock(pdf, meta.mockupPreviewUrl, margin, y + 4, innerW, boxH) + 8
  }

  if (meta.notes?.trim()) {
    const noteLines = pdf.splitTextToSize(meta.notes.trim(), innerW - 8)
    const noteH = 14 + noteLines.length * 4.5
    pdf.setFillColor(248, 250, 252)
    pdf.setDrawColor(203, 213, 225)
    pdf.roundedRect(margin, y, innerW, noteH, 2, 2, 'FD')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(51, 65, 85)
    pdf.text('DESIGN NOTES', margin + 4, y + 6)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(15, 23, 42)
    let ny = y + 12
    noteLines.forEach((line) => {
      pdf.text(line, margin + 4, ny)
      ny += 4.5
    })
    y += noteH + 8
  }

  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.text(
    meta.mockupPreviewUrl
      ? 'Page 1: design on T-shirt. Page 2: print file (image · text · emoji in a row).'
      : 'Page 2 contains print-ready artwork for direct printing.',
    margin,
    Math.min(y + 4, pageH - 28),
    { maxWidth: innerW },
  )

  pdf.setDrawColor(226, 232, 240)
  pdf.line(margin, pageH - 16, pageW - margin, pageH - 16)
  pdf.setFontSize(7.5)
  pdf.text(`${COMPANY.name}`, pageW / 2, pageH - 10, { align: 'center' })
}

function drawPrintReadyPage(pdf: jsPDF, meta: DesignPdfMeta) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 12

  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, pageW, pageH, 'F')

  const headerH = 24
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, pageW, headerH, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('PRINT READY DESIGN', margin, 15)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const sub =
    meta.title && meta.title.length < 48
      ? meta.title
      : 'Image · text · emoji — print layout'
  pdf.text(sub, pageW - margin, 15, { align: 'right' })

  const footerH = 28
  const artTop = headerH + 6
  const artBottom = pageH - footerH - 4
  const artMaxW = pageW - margin * 2
  const artMaxH = artBottom - artTop

  const ar =
    meta.printAspectRatio && meta.printAspectRatio > 0.05 && meta.printAspectRatio < 20
      ? meta.printAspectRatio
      : meta.artworkWidthPx && meta.artworkHeightPx
        ? meta.artworkWidthPx / meta.artworkHeightPx
        : 4 / 5

  const fill = 0.96
  let dw: number
  let dh: number
  if (ar > 1.25) {
    dw = artMaxW * fill
    dh = dw / ar
    if (dh > artMaxH * fill) {
      dh = artMaxH * fill
      dw = dh * ar
    }
  } else {
    dh = artMaxH * fill
    dw = dh * ar
    if (dw > artMaxW * fill) {
      dw = artMaxW * fill
      dh = dw / ar
    }
  }
  const ix = (pageW - dw) / 2
  const iy = artTop + (artMaxH - dh) / 2

  const url = meta.artworkDataUrl
  if (url.startsWith('data:image/')) {
    const fmt: 'PNG' | 'JPEG' = url.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    try {
      pdf.addImage(url, fmt, ix, iy, dw, dh, undefined, 'SLOW')
    } catch {
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(11)
      pdf.setTextColor(148, 163, 184)
      pdf.text('Artwork could not be embedded.', margin, iy + 20)
    }
  }

  const footY = pageH - footerH + 6
  pdf.setDrawColor(226, 232, 240)
  pdf.line(margin, footY - 4, pageW - margin, footY - 4)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(51, 65, 85)

  const wMm = meta.printWidthMm ?? '—'
  const hMm = meta.printHeightMm ?? '—'
  const px =
    meta.artworkWidthPx && meta.artworkHeightPx
      ? `${meta.artworkWidthPx} × ${meta.artworkHeightPx} px`
      : '—'

  pdf.text(`Print area (approx.): ${wMm} × ${hMm} mm`, margin, footY)
  pdf.text(`Export resolution: ${px}`, margin, footY + 5)
  pdf.text(`T-shirt colour: ${meta.color ?? '—'}`, margin, footY + 10)
  pdf.text(`Created: ${formatOrderDate(meta.orderDate)}`, pageW - margin, footY, { align: 'right' })
}

/**
 * Professional two-page PDF: invoice (page 1) + print-ready artwork (page 2).
 */
export function buildDesignPdf(meta: DesignPdfMeta): jsPDF {
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  })

  drawInvoicePage(pdf, meta)

  if (meta.artworkDataUrl?.startsWith('data:image/')) {
    pdf.addPage()
    drawPrintReadyPage(pdf, meta)
  }

  return pdf
}

/** @deprecated Use buildDesignPdf(meta) with artworkDataUrl inside meta. */
export function buildDesignPdfLegacy(imageDataUrl: string, meta: Omit<DesignPdfMeta, 'artworkDataUrl'>) {
  return buildDesignPdf({ ...meta, artworkDataUrl: imageDataUrl })
}

export type DesignPdfResult = {
  fileName: string
  dataUrl: string
  orderId: string
  /** Separate transparent PNG for admin / print shop. */
  printPngDataUrl?: string
  download?: DownloadResult
}

export async function downloadDesignPdf(
  meta: DesignPdfMeta,
  printPngDataUrl?: string,
): Promise<DesignPdfResult> {
  const orderId = meta.orderId || `ORD-${Date.now()}`
  const safe =
    meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'design'
  const fileName = `carpe-diem-invoice-${safe}-${Date.now()}.pdf`
  const pdf = buildDesignPdf({ ...meta, orderId })
  const download = await savePdfFile(pdf, fileName)
  return { fileName, dataUrl: pdfDataUri(pdf), orderId, printPngDataUrl, download }
}

// ── Cart / order-summary PDF ───────────────────────────────────────────────

export type CartPdfItem = {
  id?: string
  title: string
  qty: number
  price: number
  size?: string
  color?: string
  previewImage?: string
  slug?: string
  printArtwork?: string
  printAspectRatio?: number
  printArtworkWidthPx?: number
  printArtworkHeightPx?: number
  printWidthMm?: number
  printHeightMm?: number
}

function resolveCartItemPrintArtwork(it: CartPdfItem): string | null {
  if (it.printArtwork?.startsWith('data:')) return it.printArtwork
  if (it.id) {
    const session = readPrintArtworkForCartItem(it.id)
    if (session) return session
  }
  return null
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

  const mockupPreview = items.find((it) => it.previewImage?.startsWith('data:image/'))
    ?.previewImage
  if (mockupPreview) {
    if (y + 98 > pageH - 70) {
      footer()
      pdf.addPage()
      header()
      y = 32
    }
    y = drawMockupPlacementBlock(pdf, mockupPreview, margin, y + 6, usableW, 92) + 10
  }

  if (y > pageH - 55) {
    footer()
    pdf.addPage()
    header()
    y = 32
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('Items', margin, y + 4)
  y += 10

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(100, 116, 139)
  pdf.text('Product', margin, y)
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
    const hasDesignLine = !!extractDesignTextFromTitle(it.title)
    const rowH = hasDesignLine ? 26 : 20
    if (y + rowH > pageH - 60) {
      footer()
      pdf.addPage()
      header()
      y = 32
    }

    const titleX = margin
    pdf.setFont('helvetica', 'bold')
    const productLabel = it.title.replace(/\s*·\s*[“"][^”"]+[”"]\s*$/, '').trim() || it.title
    const titleLines = pdf.splitTextToSize(productLabel, usableW - 70)
    pdf.text(titleLines.slice(0, 2), titleX, y + 2)

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    const extras = [it.size && `Size ${it.size}`, it.color && it.color].filter(Boolean).join(' · ')
    if (extras) pdf.text(extras, titleX, y + 8)
    const designLine = extractDesignTextFromTitle(it.title)
    if (designLine) {
      pdf.setTextColor(15, 23, 42)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text(`Text: ${designLine}`, titleX, y + 14)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.setFontSize(9)
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

  const customPrintItems = items.filter((it) => resolveCartItemPrintArtwork(it))
  if (customPrintItems.length > 0) {
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    pdf.text(
      `Print-ready design on next ${customPrintItems.length} page(s) — text / logo / emoji for production.`,
      margin,
      pageH - 24,
      { maxWidth: usableW },
    )
  }

  footer()

  const orderDate = new Date().toISOString()
  customPrintItems.forEach((it) => {
    const artwork = resolveCartItemPrintArtwork(it)
    if (!artwork) return
    pdf.addPage()
    drawPrintReadyPage(pdf, {
      title: it.title,
      color: it.color,
      size: it.size,
      quantity: it.qty,
      artworkDataUrl: artwork,
      printAspectRatio: it.printAspectRatio,
      artworkWidthPx: it.printArtworkWidthPx,
      artworkHeightPx: it.printArtworkHeightPx,
      printWidthMm: it.printWidthMm,
      printHeightMm: it.printHeightMm,
      designText: extractDesignTextFromTitle(it.title),
      orderId: meta.orderRef,
      orderDate,
    })
  })

  return pdf
}

export async function downloadCartPdf(
  items: CartPdfItem[],
  meta: CartPdfMeta,
): Promise<{ fileName: string; download: DownloadResult }> {
  const fileName = `carpe-diem-cart-${Date.now()}.pdf`
  const pdf = buildCartPdf(items, meta)
  const download = await savePdfFile(pdf, fileName)
  return { fileName, download }
}
