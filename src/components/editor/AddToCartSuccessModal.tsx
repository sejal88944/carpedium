'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PdfWhatsAppHint } from '@/components/order/PdfWhatsAppHint'
import { pdfDownloadedAttachHint } from '@/data/orderHints'
import {
  downloadStoredInvoicePdf,
  downloadStoredPrintOnlyPdf,
  downloadStoredPrintPng,
} from '@/lib/designExportStore'
import { buildWhatsAppOrderUrl } from '@/lib/whatsappOrder'

type Props = {
  cartItemId: string
  orderId: string
  invoiceFileName: string
  onClose: () => void
}

export function AddToCartSuccessModal({ cartItemId, orderId, invoiceFileName, onClose }: Props) {
  const [busy, setBusy] = useState<'invoice' | 'print' | 'png' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [pdfAutoDone, setPdfAutoDone] = useState(false)

  const whatsappHref = buildWhatsAppOrderUrl(
    [{ title: `Custom design · ${orderId}`, qty: 1, price: 0, previewImage: 'x' }],
    { pdfFileName: invoiceFileName },
  )

  useEffect(() => {
    if (pdfAutoDone) return
    let cancelled = false
    let attempts = 0

    const tryAutoDownload = async () => {
      if (cancelled || attempts > 12) return
      attempts += 1
      try {
        const res = await downloadStoredInvoicePdf(cartItemId)
        if (res.ok) {
          setPdfAutoDone(true)
          setMsg(pdfDownloadedAttachHint())
          return
        }
      } catch {
        /* retry */
      }
      window.setTimeout(() => void tryAutoDownload(), 450)
    }

    window.setTimeout(() => void tryAutoDownload(), 300)
    return () => {
      cancelled = true
    }
  }, [cartItemId, pdfAutoDone])

  async function run(
    kind: 'invoice' | 'print' | 'png',
    fn: () => Promise<{ ok: boolean; openedInTab?: boolean; shared?: boolean }>,
  ) {
    setBusy(kind)
    setMsg(null)
    try {
      const res = await fn()
      if (!res.ok) {
        setMsg('File not ready — parat try kara.')
        return
      }
      if (res.openedInTab || res.shared) {
        setMsg(`${pdfDownloadedAttachHint()} (Save / Share पण करू शकता.)`)
      } else {
        setMsg(pdfDownloadedAttachHint())
      }
    } catch {
      setMsg('Download failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto overscroll-contain sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(92dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-void-2 sm:rounded-3xl"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Added to cart</p>
          <h2 id="cart-success-title" className="mt-2 font-display text-2xl font-bold">
            Design saved
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>

          <PdfWhatsAppHint
            variant="success"
            message={msg || pdfDownloadedAttachHint()}
            className="mt-4"
          />

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void run('invoice', () => downloadStoredInvoicePdf(cartItemId))}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 py-4 text-sm font-bold text-white shadow-glow disabled:opacity-60"
            >
              {busy === 'invoice' ? 'Preparing…' : 'Download Design PDF (Invoice)'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void run('print', () => downloadStoredPrintOnlyPdf(cartItemId))}
              className="w-full rounded-2xl border-2 border-brand py-3.5 text-sm font-bold text-brand disabled:opacity-60"
            >
              {busy === 'print' ? 'Preparing…' : 'Download Print Design PDF'}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void run('png', () => downloadStoredPrintPng(cartItemId))}
              className="w-full rounded-2xl border border-black/10 py-3.5 text-sm font-semibold disabled:opacity-60 dark:border-white/10"
            >
              {busy === 'png' ? 'Preparing…' : 'Download Artwork PNG'}
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="w-full rounded-2xl bg-[#25D366] py-4 text-center text-sm font-bold text-white"
            >
              Order on WhatsApp (PDF attach kara)
            </a>
            <Link
              href="/cart"
              className="w-full rounded-2xl border-2 border-[#25D366] py-3.5 text-center text-sm font-bold text-[#128C7E] dark:text-[#25D366]"
            >
              Go to Cart
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-zinc-200"
            >
              Continue Shopping
            </button>
          </div>

          {msg ? (
            <p className="mt-4 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {msg}
            </p>
          ) : (
            <p className="mt-4 text-center text-[11px] text-slate-500">{invoiceFileName}</p>
          )}
        </div>
      </div>
    </div>
  )
}
