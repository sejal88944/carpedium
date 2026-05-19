'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'

const STEPS = [
  'Choose T-shirt',
  'Select color',
  'Upload logo/image',
  'Auto fit on chest',
  'Resize / rotate / drag',
  'Preview front & back',
  'Add to cart',
  'Order on WhatsApp',
]

export function LiveCustomizationDemo() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Live Customization Demo
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Upload logo, add text, and preview it on the T-shirt instantly
          </h2>
          <p className="mt-4 text-slate-600 dark:text-zinc-400">
            Our editor automatically centers transparent PNG logos on the chest area, keeps quality
            intact, and lets you drag, resize, rotate, add text, change fonts and preview front/back.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <div key={s} className="glass rounded-2xl p-4">
                <span className="text-xs font-bold text-brand">STEP {i + 1}</span>
                <p className="mt-1 font-semibold">{s}</p>
              </div>
            ))}
          </div>
          <Link
            href="/design"
            className="mt-8 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-7 py-3 text-sm font-bold text-white shadow-glow"
          >
            Open T-shirt Editor
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] border border-black/5 bg-slate-100 p-6 shadow-2xl dark:border-white/10 dark:bg-void-2"
        >
          <PlainTeeMockup
            fill={TEE_COLORS[0].hex}
            text="YOUR LOGO"
            textColor="#ffffff"
            size="lg"
            className="mx-auto rounded-3xl"
          />
          <div className="absolute right-6 top-6 rounded-2xl bg-white/90 p-4 text-sm shadow-xl dark:bg-void-3/90">
            <p className="font-bold text-brand">Auto centered</p>
            <p className="text-xs text-slate-500">HD print zone</p>
          </div>
          <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 p-4 text-sm shadow-xl dark:bg-void-3/90">
            <p className="font-bold">Front / Back</p>
            <p className="text-xs text-slate-500">Live preview</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
