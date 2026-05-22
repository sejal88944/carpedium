'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Breadcrumbs } from './Breadcrumbs'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  cta?: { label: string; href: string }[]
  variant?: 'default' | 'dark'
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  cta,
  variant = 'default',
}: Props) {
  const dark = variant === 'dark'
  return (
    <section
      className={`relative w-full max-w-full overflow-hidden border-b border-black/5 py-12 sm:py-16 md:py-28 ${
        dark
          ? 'bg-gradient-to-br from-void via-void-2 to-slate-900 text-white'
          : 'bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-void dark:via-void-2 dark:to-slate-950'
      }`}
    >
      <motion.div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} dark={dark} /> : null}
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>
        ) : null}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl ${
            dark ? 'text-white' : ''
          }`}
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mt-5 max-w-2xl text-lg leading-relaxed ${
              dark ? 'text-zinc-300' : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            {subtitle}
          </motion.p>
        ) : null}
        {cta?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {cta.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-7 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]"
              >
                {c.label}
              </Link>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
