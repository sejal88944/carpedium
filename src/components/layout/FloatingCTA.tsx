'use client'

import { COMPANY } from '@/data/brand'

export function FloatingCTA() {
  return (
    <>
      <div className="fixed bottom-6 right-4 z-50 hidden flex-col gap-3 sm:right-6 md:flex">
      <a
        href={`https://wa.me/${COMPANY.whatsapp}?text=Hi%20AASHA-SM%20TECH%2C%20I%20need%20custom%20T-shirt%20printing`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-lg transition hover:scale-105"
        aria-label="WhatsApp"
      >
        💬
      </a>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-black/10 bg-white/95 text-xs font-bold shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-void/95 md:hidden">
        <a
          href={`https://wa.me/${COMPANY.whatsapp}?text=Hi%20AASHA-SM%20TECH%2C%20I%20need%20custom%20T-shirt%20printing`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2 text-[#16a34a]"
        >
          <span className="text-lg">💬</span>
          WhatsApp
        </a>
        <a
          href="/design"
          className="flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-sky-500 to-blue-700 py-2 text-white"
        >
          <span className="text-lg">👕</span>
          Customize
        </a>
      </div>
    </>
  )
}
