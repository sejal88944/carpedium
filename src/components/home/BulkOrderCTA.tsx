'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { COMPANY } from '@/data/brand'

export function BulkOrderCTA() {
  return (
    <section className="border-y border-black/5 bg-gradient-to-br from-slate-900 via-void to-slate-950 py-20 text-white dark:border-white/10 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">
              Bulk Orders
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
              Corporate & Event Bulk T-Shirt Printing
            </h2>
            <p className="mt-5 text-lg text-zinc-400">
              MOQ from 25 pieces · Volume discounts · Free design support · Pan-India delivery
              across Pune, Mumbai, Hyderabad, Bangalore, Nagpur & Nashik.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/bulk-orders"
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-8 py-3.5 text-sm font-bold shadow-glow transition hover:scale-105"
              >
                Get Bulk Quote
              </Link>
              <Link
                href={`https://wa.me/${COMPANY.whatsapp}`}
                className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-bold transition hover:bg-white/10"
              >
                WhatsApp Us
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[2rem] p-8"
          >
            <ul className="space-y-4 text-sm">
              {[
                '25+ pieces — 5% off',
                '50+ pieces — 12% off',
                '100+ pieces — 18% off',
                '500+ pieces — custom pricing',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
