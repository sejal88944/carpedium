'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COMPANY } from '@/data/brand'
import { useAdminStore } from '@/store/useAdminStore'

type DisplayReview = { name: string; city?: string; text: string; rating: number }

const SEED_REVIEWS: DisplayReview[] = [
  { name: 'Rahul K.', city: 'Pune', rating: 5, text: 'Best custom tshirt printing company — crisp prints and fast delivery.' },
  { name: 'Priya M.', city: 'Mumbai', rating: 5, text: 'Corporate uniforms for our startup — professional quality.' },
  { name: 'Ankit S.', city: 'Hyderabad', rating: 5, text: 'Bulk event t-shirts delivered on time. Highly recommend!' },
]

export function ReviewsSection() {
  const adminReviews = useAdminStore((s) => s.reviews)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const reviews = useMemo<DisplayReview[]>(() => {
    if (!hydrated) return SEED_REVIEWS
    const approved = adminReviews
      .filter((r) => r.approved)
      .map((r) => ({
        name: r.customerName,
        text: r.body || r.title || '',
        rating: Math.min(5, Math.max(1, r.rating || 5)),
      }))
      .filter((r) => r.text)
    if (approved.length === 0) return SEED_REVIEWS
    return approved.slice(0, 6)
  }, [hydrated, adminReviews])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-brand">★ {COMPANY.rating}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Google Reviews</h2>
          <p className="text-slate-600 dark:text-zinc-400">{COMPANY.reviewCount}+ happy customers</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={`${r.name}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <p className="text-brand">{'★'.repeat(r.rating)}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-zinc-300">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 font-semibold">{r.name}</p>
              {r.city ? <p className="text-xs text-slate-500">{r.city}</p> : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
