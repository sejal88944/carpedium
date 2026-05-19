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
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-24 pt-8 dark:from-void dark:via-void-2 dark:to-void">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">
              Nike-style Customizer
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
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
