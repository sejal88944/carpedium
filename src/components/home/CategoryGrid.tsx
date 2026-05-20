'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES, TEE_COLORS } from '@/data/brand'
import { useAdminStore } from '@/store/useAdminStore'

type DisplayCategory = {
  id: string
  name: string
  slug: string
  image: string
  images: string[]
  tagline: string
  surface: string
}

const FALLBACK_SURFACE = '#f1f1ef'
const FALLBACK_IMAGE = '/categories/men.png'

export function CategoryGrid() {
  const adminCategories = useAdminStore((s) => s.categories)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const items: DisplayCategory[] = useMemo(() => {
    if (!hydrated || adminCategories.length === 0) {
      return CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        images: [...(c.images ?? [c.image])],
        tagline: c.tagline,
        surface: c.surface,
      }))
    }
    return adminCategories.map((c) => {
      const seed = CATEGORIES.find((s) => s.slug === c.slug)
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image || seed?.image || FALLBACK_IMAGE,
        images: seed?.images ? [...seed.images] : [c.image || seed?.image || FALLBACK_IMAGE],
        tagline: c.tagline || seed?.tagline || '',
        surface: c.surface || seed?.surface || FALLBACK_SURFACE,
      }
    })
  }, [hydrated, adminCategories])

  const [quickView, setQuickView] = useState<string | null>(null)
  const cat = items.find((c) => c.id === quickView)

  return (
    <section id="categories" className="bg-slate-50 py-20 dark:bg-void-2 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
            Category Grid
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Shop by category</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-zinc-400">
            Men, Women &amp; Couple custom T-shirts — premium photo-grade preview, ready to customize.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => {
            const isDark = isHexDark(c.surface)
            const gallery = (c.images && c.images.length > 0 ? c.images : [c.image]) as string[]
            return (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_10px_40px_-20px_rgba(15,23,42,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-zinc-900"
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden"
                  style={{ backgroundColor: c.surface }}
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: isDark
                        ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.08), transparent 65%)'
                        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.6), transparent 70%)',
                    }}
                  />

                  <CategoryImageStage
                    images={gallery}
                    alt={`${c.name} — custom printing by Carpe Diem`}
                    priority={i < 3}
                  />

                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      isDark
                        ? 'bg-white/15 text-white ring-1 ring-white/20'
                        : 'bg-black/70 text-white ring-1 ring-black/10'
                    }`}
                  >
                    {shortName(c.name)}
                  </span>

                  {gallery.length > 1 ? (
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        isDark
                          ? 'bg-white/15 text-white ring-1 ring-white/20'
                          : 'bg-black/70 text-white ring-1 ring-black/10'
                      }`}
                    >
                      {gallery.length} Designs
                    </span>
                  ) : null}

                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                    style={{
                      background: isDark
                        ? 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                        : 'linear-gradient(to top, rgba(15,23,42,0.55), transparent)',
                    }}
                  />
                  <p className="absolute bottom-3 left-3 right-3 text-center text-[11px] font-medium text-white/95 drop-shadow">
                    {c.tagline}
                  </p>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-semibold leading-tight">{c.name}</h3>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      ★ 4.9
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    {TEE_COLORS.slice(0, 6).map((tc) => (
                      <span
                        key={tc.id}
                        title={tc.name}
                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: tc.hex }}
                      />
                    ))}
                    <span className="ml-1 text-[10px] font-semibold text-slate-500">+12</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickView(c.id)}
                      className="flex-1 rounded-full border border-brand/30 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10"
                    >
                      Quick View
                    </button>
                    <Link
                      href={`/shop?category=${c.slug}`}
                      className="flex-1 rounded-full bg-brand py-2 text-center text-xs font-bold text-white transition hover:bg-brand/90"
                    >
                      Shop
                    </Link>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10 dark:text-white"
          >
            View all categories <span>→</span>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {cat ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setQuickView(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:grid-cols-2"
            >
              <div className="relative aspect-square sm:aspect-auto" style={{ backgroundColor: cat.surface }}>
                <CategoryImageStage
                  images={cat.images.length > 0 ? cat.images : [cat.image]}
                  alt={cat.name}
                  priority
                />
              </div>
              <div className="flex flex-col p-6">
                <h3 className="font-display text-2xl font-bold">{cat.name}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{cat.tagline}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-zinc-400">
                  <li>• 12 premium colours available</li>
                  <li>• Bulk discounts from 25 pcs</li>
                  <li>• Free design proof in 2 hours</li>
                  <li>• Pan-India delivery</li>
                </ul>
                <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
                  <Link
                    href={`/design?category=${cat.slug}`}
                    className="flex-1 rounded-full bg-brand py-3 text-center text-sm font-bold text-white"
                  >
                    Customize now
                  </Link>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="flex-1 rounded-full border border-slate-300 py-3 text-center text-sm font-bold text-slate-900 dark:border-white/20 dark:text-white"
                  >
                    Browse shop
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function CategoryImageStage({
  images,
  alt,
  priority,
}: {
  images: string[]
  alt: string
  priority?: boolean
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [images.length])

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={priority && i === 0}
          className={`object-contain p-3 transition-opacity duration-700 ease-out sm:p-4 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        />
      ))}
    </>
  )
}

function isHexDark(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return r * 0.299 + g * 0.587 + b * 0.114 < 140
}

function shortName(name: string) {
  return name.replace(/\sT-Shirts?$/i, '')
}
