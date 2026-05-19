'use client'

import { motion } from 'framer-motion'

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-slate-600 dark:text-zinc-400">{subtitle}</p>
      ) : null}
    </motion.div>
  )
}
