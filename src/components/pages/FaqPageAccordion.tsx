'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { FaqCategory } from '@/data/faq'

export function FaqPageAccordion({ categories }: { categories: FaqCategory[] }) {
  const [openId, setOpenId] = useState<string | null>(categories[0]?.items[0]?.q ?? null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-12"
    >
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl font-bold text-brand md:text-2xl">{cat.title}</h2>
          <motion.div layout className="mt-5 space-y-3">
            {cat.items.map((item) => {
              const isOpen = openId === item.q
              return (
                <motion.div
                  key={item.q}
                  layout
                  className="glass overflow-hidden rounded-2xl border border-black/5 dark:border-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : item.q)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-black/5 px-6 pb-5 pt-0 text-slate-600 dark:border-white/5 dark:text-zinc-400">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}
