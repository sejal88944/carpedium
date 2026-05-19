'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Minimum order?',
    a: 'Single-piece custom T-shirt orders are available. Bulk discounts start from 25 pieces.',
  },
  {
    q: 'Delivery time?',
    a: 'Standard delivery is usually 3–7 working days depending on quantity, city and printing type.',
  },
  {
    q: 'Printing quality?',
    a: 'We use HD printing methods suitable for logos, typography, corporate uniforms and event wear.',
  },
  {
    q: 'Bulk discounts?',
    a: 'Yes. Pricing improves for corporate, startup, college, event and reseller bulk orders.',
  },
]

export function FAQAccordion() {
  const [open, setOpen] = useState(0)

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          FAQ
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold md:text-4xl">
          Common printing questions
        </h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((item, i) => (
            <button
              key={item.q}
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              className="glass w-full rounded-2xl p-5 text-left"
            >
              <span className="flex items-center justify-between gap-4 font-semibold">
                {item.q}
                <span>{open === i ? '−' : '+'}</span>
              </span>
              {open === i ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">{item.a}</p>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
