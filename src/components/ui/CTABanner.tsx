'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function CTABanner({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string
  subtitle: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-600 via-brand to-blue-800 px-8 py-14 text-center text-white shadow-2xl md:px-16"
      >
        <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sky-100">{subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={primary.href}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand shadow-lg transition hover:scale-105"
          >
            {primary.label}
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="rounded-full border-2 border-white/60 px-8 py-3.5 text-sm font-bold transition hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </section>
  )
}
