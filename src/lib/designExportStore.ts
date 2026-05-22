import type { DesignPdfMeta } from '@/lib/designPdf'
import { buildDesignPdf, buildPrintOnlyPdf } from '@/lib/designPdf'
import { downloadDataUrlFile, pdfDataUri, savePdfFile } from '@/lib/downloadFile'
import { readPrintArtworkForCartItem } from '@/lib/designArtworkExport'

const EXPORT_PREFIX = 'carpe-design-export:'

export type StoredDesignExport = {
  orderId: string
  invoiceFileName: string
  printOnlyFileName: string
  /** Full 2-page invoice PDF (may be omitted if storage quota exceeded). */
  invoicePdfDataUrl?: string
  printOnlyPdfDataUrl?: string
  printArtworkDataUrl?: string
  mockupDataUrl?: string
  meta: DesignPdfMeta
  savedAt: string
}

export function stashDesignExport(cartItemId: string, data: StoredDesignExport) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(`${EXPORT_PREFIX}${cartItemId}`, JSON.stringify(data))
  } catch {
    try {
      sessionStorage.setItem(
        `${EXPORT_PREFIX}${cartItemId}`,
        JSON.stringify({
          ...data,
          invoicePdfDataUrl: undefined,
          printOnlyPdfDataUrl: undefined,
        }),
      )
    } catch {
      /* quota */
    }
  }
}

export function readDesignExport(cartItemId: string): StoredDesignExport | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(`${EXPORT_PREFIX}${cartItemId}`)
    if (!raw) return null
    return JSON.parse(raw) as StoredDesignExport
  } catch {
    return null
  }
}

function resolveArtwork(meta: DesignPdfMeta, cartItemId: string): string {
  if (meta.artworkDataUrl?.startsWith('data:')) return meta.artworkDataUrl
  const session = readPrintArtworkForCartItem(cartItemId)
  return session || ''
}

/** Rebuild PDFs if session blob was dropped (quota). */
export function ensureDesignExportPdfs(stored: StoredDesignExport, cartItemId: string) {
  const artwork = resolveArtwork(stored.meta, cartItemId)
  const meta: DesignPdfMeta = {
    ...stored.meta,
    artworkDataUrl: artwork || stored.meta.artworkDataUrl,
    orderId: stored.orderId,
  }
  if (!artwork.startsWith('data:')) return stored

  let invoicePdfDataUrl = stored.invoicePdfDataUrl
  let printOnlyPdfDataUrl = stored.printOnlyPdfDataUrl
  if (!invoicePdfDataUrl?.startsWith('data:')) {
    const pdf = buildDesignPdf(meta)
    invoicePdfDataUrl = pdfDataUri(pdf)
  }
  if (!printOnlyPdfDataUrl?.startsWith('data:')) {
    const printPdf = buildPrintOnlyPdf(meta)
    printOnlyPdfDataUrl = pdfDataUri(printPdf)
  }
  return { ...stored, invoicePdfDataUrl, printOnlyPdfDataUrl, meta }
}

export async function downloadStoredInvoicePdf(cartItemId: string) {
  const stored = readDesignExport(cartItemId)
  if (!stored) return { ok: false as const, reason: 'missing' as const }
  const full = ensureDesignExportPdfs(stored, cartItemId)
  if (full.invoicePdfDataUrl?.startsWith('data:')) {
    return downloadDataUrlFile(full.invoicePdfDataUrl, full.invoiceFileName)
  }
  const pdf = buildDesignPdf(full.meta)
  return savePdfFile(pdf, full.invoiceFileName)
}

export async function downloadStoredPrintOnlyPdf(cartItemId: string) {
  const stored = readDesignExport(cartItemId)
  if (!stored) return { ok: false as const, reason: 'missing' as const }
  const full = ensureDesignExportPdfs(stored, cartItemId)
  if (full.printOnlyPdfDataUrl?.startsWith('data:')) {
    return downloadDataUrlFile(full.printOnlyPdfDataUrl, full.printOnlyFileName)
  }
  const pdf = buildPrintOnlyPdf(full.meta)
  return savePdfFile(pdf, full.printOnlyFileName)
}

export async function downloadStoredPrintPng(cartItemId: string) {
  const stored = readDesignExport(cartItemId)
  const artwork =
    stored?.printArtworkDataUrl ||
    readPrintArtworkForCartItem(cartItemId) ||
    stored?.meta.artworkDataUrl
  if (!artwork?.startsWith('data:')) return { ok: false as const, reason: 'missing' as const }
  const name = `carpe-diem-print-${stored?.orderId || cartItemId}.png`
  return downloadDataUrlFile(artwork, name)
}

export function isCustomCartItem(id: string, hasPrintArtwork?: boolean) {
  return id.startsWith('custom-') || !!hasPrintArtwork || !!readDesignExport(id)
}
