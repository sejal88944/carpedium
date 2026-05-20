import type { AdminUpload } from '@/store/useAdminStore'
import { downloadDataUrl, downloadJson } from '@/lib/designArtworkExport'

export function downloadInvoicePdf(upload: AdminUpload) {
  if (!upload.pdfUrl) return false
  const name = upload.pdfFileName || `invoice-${upload.orderId || upload.id}.pdf`
  downloadDataUrl(upload.pdfUrl, name)
  return true
}

export function downloadPrintDesignPng(upload: AdminUpload) {
  const src = upload.printArtworkUrl || upload.url
  if (!src?.startsWith('data:')) return false
  const safe =
    (upload.orderId || upload.label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'design'
  downloadDataUrl(src, `aasha-sm-print-${safe}.png`)
  return true
}

export function downloadDesignJson(upload: AdminUpload) {
  if (!upload.designJson) return false
  try {
    const parsed = JSON.parse(upload.designJson) as unknown
    const safe =
      (upload.orderId || upload.id).toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'design'
    downloadJson(parsed, `aasha-sm-design-${safe}.json`)
    return true
  } catch {
    return false
  }
}

export function downloadMockupPng(upload: AdminUpload) {
  const src = upload.mockupPreviewUrl || upload.url
  if (!src?.startsWith('data:')) return false
  const safe =
    (upload.orderId || upload.label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'mockup'
  downloadDataUrl(src, `aasha-sm-mockup-${safe}.png`)
  return true
}
