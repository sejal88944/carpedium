'use client'

import {
  DETAILS_FILLED_PDF_HINT,
  WHATSAPP_ATTACH_STEPS,
  pdfDownloadedAttachHint,
} from '@/data/orderHints'

type Variant = 'details' | 'success' | 'compact'

type Props = {
  variant?: Variant
  /** Override body text (e.g. after PDF actually downloaded). */
  message?: string
  className?: string
}

export function PdfWhatsAppHint({ variant = 'details', message, className = '' }: Props) {
  const body =
    message || (variant === 'success' ? pdfDownloadedAttachHint() : DETAILS_FILLED_PDF_HINT)

  if (variant === 'compact') {
    return (
      <p
        className={`text-[11px] font-medium leading-relaxed text-amber-800 dark:text-amber-200 ${className}`}
      >
        {body}
      </p>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-500/40 dark:from-amber-500/15 dark:to-orange-500/10 ${className}`}
      role="status"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
        📎 PDF + WhatsApp
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-amber-950 dark:text-amber-100">
        {body}
      </p>
      {variant === 'success' ? (
        <p className="mt-2 text-[11px] text-amber-800/90 dark:text-amber-200/90">{WHATSAPP_ATTACH_STEPS}</p>
      ) : null}
    </div>
  )
}
