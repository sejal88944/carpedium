/** User-facing hints for PDF download + WhatsApp attach (Marathi + English). */

export function getMobileBrowserLabel(): string {
  if (typeof navigator === 'undefined') return 'browser'
  const ua = navigator.userAgent
  if (/CriOS|Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome'
  if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) return 'Safari'
  if (/Firefox/i.test(ua)) return 'Firefox'
  return 'browser'
}

/** Shown under “Your details” when name, phone & address are filled. */
export const DETAILS_FILLED_PDF_HINT =
  'Details भरले! Add to Cart केल्यावर PDF तुमच्या phone च्या browser मध्ये download होईल. WhatsApp वर order करताना ती PDF 📎 icon वरून attach करायला विसरू नका.'

export function pdfDownloadedAttachHint(browser = getMobileBrowserLabel()): string {
  return `तुमच्या ${browser} मध्ये PDF download झाली आहे — WhatsApp वर Order करताना 📎 वरून ती PDF attach करा.`
}

export const WHATSAPP_ATTACH_STEPS =
  'WhatsApp उघडा → 📎 Attach → Downloads / Files → PDF निवडा → Send'
