'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { COMPANY, TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'

export function Hero() {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand/30 py-16 text-white sm:py-24 md:py-32">
      <motion.div
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300"
          >
            {COMPANY.name}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl md:text-6xl"
          >
            Premium Custom T-Shirt Printing for Brands & Businesses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-slate-300"
          >
            Custom tshirt printing Pune, polo tshirt printing, corporate tshirts, bulk tshirt
            supplier and startup branding apparel with HD print quality.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/design"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-brand to-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(14,165,233,0.7)] transition hover:scale-[1.04] hover:shadow-[0_15px_50px_-10px_rgba(14,165,233,0.9)]"
            >
              Start Designing
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/bulk-orders"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:scale-[1.04] hover:border-white hover:bg-white hover:text-slate-900"
            >
              Bulk Order
              <span>📦</span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap gap-6 text-sm text-slate-400"
          >
            <span>📍 {COMPANY.locations.join(' · ')}</span>
            <span>🕐 {COMPANY.hours}</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.25 }}
          className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]"
        >
          <motion.div
            className="absolute left-0 top-8 w-40 rounded-3xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl md:w-48"
            animate={{ y: [0, -12, 0], rotate: [-4, -1, -4] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <PlainTeeMockup fill={TEE_COLORS[0].hex} className="rounded-2xl" />
          </motion.div>
          <motion.div
            className="absolute right-0 top-0 w-52 rounded-3xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl md:w-64"
            animate={{ y: [0, 14, 0], rotate: [3, 0, 3] }}
            transition={{ duration: 7, repeat: Infinity }}
          >
            <PlainTeeMockup fill={TEE_COLORS[2].hex} className="rounded-2xl" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-1/2 w-56 -translate-x-1/2 rounded-3xl border border-white/20 bg-white/15 p-2 shadow-2xl backdrop-blur-xl md:w-72"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <PlainTeeMockup fill={TEE_COLORS[6].hex} className="rounded-2xl" size="lg" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
