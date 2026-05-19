'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TEE_COLORS } from '@/data/brand'
import { useStorefrontProducts } from '@/store/adminSeed'
import { useCart } from '@/store/useCart'

const TRENDING_RATINGS: Record<string, number> = {
  'streetwear-retro-rider': 4.9,
  'couple-unvybed-set': 4.9,
  'corporate-monogram-tee': 4.8,
  'men-everyday-premium': 4.8,
  'startup-rags-to-riches': 4.7,
  'plain-white-essential': 4.9,
}

export function AITrendingSection() {
  const { add } = useCart()
  const CATALOG = useStorefrontProducts()

  const trending = CATALOG.filter((p) => p.category === 'Men T-Shirts' && p.featured).slice(0, 4)

  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Trending Products</p>
            <h2 className="mt-2 font-display text-3xl font-bold">AI Trending Suggestions</h2>
            <p className="mt-2 text-slate-400">Auto mockup generator · Smart recommendations · Live stock</p>
          </div>
          <Link href="/shop" className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold">
            View All Products
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((p, i) => {
            const rating = TRENDING_RATINGS[p.slug] ?? 4.7
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl bg-white/5"
              >
                <Link href={`/shop/${p.slug}`} className="block">
                  <div
                    className="relative aspect-square w-full overflow-hidden"
                    style={{ backgroundColor: p.surface || '#0f172a' }}
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="scale-[1.2] object-contain transition duration-500 hover:scale-[1.3]"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                      />
                    ) : null}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/shop/${p.slug}`} className="font-semibold hover:text-sky-300">
                        {p.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-400">★ {rating.toFixed(1)} · In stock</p>
                    </div>
                    <button className="rounded-full bg-white/10 px-3 py-1 text-sm" type="button" aria-label="Wishlist">
                      ♡
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-xl font-bold">₹{p.price}</p>
                      {p.compareAt ? (
                        <p className="text-xs text-slate-500 line-through">₹{p.compareAt}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-1">
                      {TEE_COLORS.slice(0, 4).map((c) => (
                        <span
                          key={c.id}
                          className="h-4 w-4 rounded-full border border-white/30"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href={`/design?product=${p.slug}`}
                      className="rounded-full bg-sky-500 py-2 text-center text-xs font-bold text-white"
                    >
                      Customize
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        add({
                          slug: p.slug,
                          title: p.title,
                          price: p.price,
                          qty: 1,
                          size: 'M',
                          imageTone: p.imageTone,
                        })
                      }
                      className="rounded-full bg-white/10 py-2 text-xs font-bold"
                    >
                      Add Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
