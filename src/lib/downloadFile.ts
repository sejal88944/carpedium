import type { jsPDF } from 'jspdf'

export type DownloadResult = {
  ok: boolean
  /** User may need to use browser Save on iOS. */
  openedInTab?: boolean
  shared?: boolean
}

function isMobileUa(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/** Blob download — works on most Android; iOS often needs tab fallback. */
export async function downloadBlob(blob: Blob, filename: string): Promise<DownloadResult> {
  if (typeof document === 'undefined') return { ok: false }

  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    await new Promise((r) => setTimeout(r, 350))

    if (isMobileUa()) {
      return openBlobInTab(blob, url, filename)
    }
    return { ok: true }
  } catch {
    return openBlobInTab(blob, url, filename)
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

async function openBlobInTab(
  blob: Blob,
  url: string,
  filename: string,
): Promise<DownloadResult> {
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (win) {
    return { ok: true, openedInTab: true }
  }

  if (typeof navigator.share === 'function') {
    try {
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return { ok: true, shared: true }
      }
    } catch {
      /* user cancelled share */
    }
  }

  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  return { ok: true, openedInTab: true }
}

/** Save jsPDF — mobile-safe (blob + tab / share fallback). */
export async function savePdfFile(pdf: jsPDF, filename: string): Promise<DownloadResult> {
  const blob = pdf.output('blob') as Blob
  const typed =
    blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' })
  return downloadBlob(typed, filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

export function pdfDataUri(pdf: jsPDF): string {
  try {
    return pdf.output('datauristring')
  } catch {
    return ''
  }
}

/** Data-URL / blob URL file download (PNG, etc.). */
export async function downloadDataUrlFile(
  dataUrl: string,
  filename: string,
): Promise<DownloadResult> {
  if (!dataUrl.startsWith('data:') && !dataUrl.startsWith('blob:')) {
    return { ok: false }
  }
  if (dataUrl.startsWith('blob:')) {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return downloadBlob(blob, filename)
  }
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return downloadBlob(blob, filename)
}
