import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DesignStudio } from '@/components/editor/DesignStudio'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Custom Design Studio',
  description:
    'Upload logo, add text, drag resize rotate — real-time HD T-shirt preview. Front & back print.',
  path: '/design',
})

function DesignContent() {
  return (
    <div className="min-h-0 w-full max-w-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-4 dark:from-void dark:via-void-2 dark:to-void sm:pt-8">
      <div className="page-shell mx-auto max-w-[1600px] py-4 sm:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-10 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand sm:text-sm">
              Nike-style Customizer
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl md:text-6xl">
              Custom Design Studio
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-zinc-400">
              Upload logo, add custom text, resize, rotate and preview instantly on a premium
              T-shirt mockup.
            </p>
          </div>
          <div className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-500 shadow-sm dark:bg-white/10 dark:text-zinc-300">
            Front / Back · HD Preview · WhatsApp Order
          </div>
        </div>
        <DesignStudio />
      </div>
    </div>
  )
}

export default function DesignPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Loading editor…</p>}>
      <DesignContent />
    </Suspense>
  )
}
