'use client'

type Props = {
  cartBusy: boolean
  hasSavedExport: boolean
  onAddToCart: () => void
  onDownloadPdf: () => void
  whatsappHref: string
}

export function DesignMobileActionBar({
  cartBusy,
  hasSavedExport,
  onAddToCart,
  onDownloadPdf,
  whatsappHref,
}: Props) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/10 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-void/95 lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-1 gap-2 p-3">
        <button
          type="button"
          disabled={cartBusy}
          onClick={onAddToCart}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 py-3.5 text-sm font-bold text-white shadow-glow disabled:opacity-60"
        >
          {cartBusy ? 'Saving design & PDF…' : 'Add to Cart'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasSavedExport || cartBusy}
            onClick={onDownloadPdf}
            className="rounded-2xl border-2 border-brand py-3 text-xs font-bold text-brand disabled:opacity-50"
          >
            Download PDF
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-2xl bg-[#25D366] py-3 text-xs font-bold text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
