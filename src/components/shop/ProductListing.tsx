'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStorefrontProducts } from '@/store/adminSeed'
import { TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'
import { useCart } from '@/store/useCart'
import { QuickViewModal } from './QuickViewModal'
import type { Product } from '@/types'

const CAT_QUERY_MAP: Record<string, string> = {
  men: 'Men T-Shirts',
  mens: 'Men T-Shirts',
  women: 'Women T-Shirts',
  womens: 'Women T-Shirts',
  couple: 'Couple T-Shirts',
  couples: 'Couple T-Shirts',
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name', label: 'Name A–Z' },
]

const CATEGORY_OPTIONS = [
  { id: 'Men T-Shirts', label: 'Mens' },
  { id: 'Women T-Shirts', label: 'Womens' },
  { id: 'Couple T-Shirts', label: 'Couple' },
] as const

const PER_PAGE = 9

function productColor(slug: string) {
  const i = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return TEE_COLORS[i % TEE_COLORS.length]
}

export function ProductListing() {
  const { toggleWishlist, wishlist } = useCart()
  const CATALOG = useStorefrontProducts()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0].id)

  useEffect(() => {
    const raw = searchParams?.get('cat') || searchParams?.get('category')
    if (!raw) return
    const mapped = CAT_QUERY_MAP[raw.toLowerCase()]
    if (mapped) setCategory(mapped)
  }, [searchParams])
  const [colorId, setColorId] = useState('all')
  const [size, setSize] = useState('all')
  const [maxPrice, setMaxPrice] = useState(2500)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [quickView, setQuickView] = useState<Product | null>(null)

  const counts = useMemo(() => {
    return CATEGORY_OPTIONS.reduce<Record<string, number>>((acc, opt) => {
      acc[opt.id] = CATALOG.filter((p) => p.category === opt.id).length
      return acc
    }, {})
  }, [CATALOG])

  const filtered = useMemo(() => {
    let list = CATALOG.filter((p) => p.category === category)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)))
    if (size !== 'all') list = list.filter((p) => p.sizes.includes(size))
    if (maxPrice < 2500) list = list.filter((p) => p.price <= maxPrice)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title))
    else list.sort((a, b) => Number(b.featured) - Number(a.featured))
    return list
  }, [CATALOG, query, category, maxPrice, size, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const filterPanel = (
    <div className="space-y-6">
      <motion.div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Search</p>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search products..."
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
        />
      </motion.div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</p>
        <div className="mt-3 flex flex-col gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id)
                setPage(1)
              }}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                category === c.id
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  category === c.id ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/15'
                }`}
              >
                {counts[c.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Size</p>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
        >
          <option value="all">All Sizes</option>
          {SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Max price: ₹{maxPrice}
        </p>
        <input
          type="range"
          min={299}
          max={2500}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TEE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColorId(c.id)}
              title={c.name}
              className={`h-8 w-8 rounded-full border-2 ${
                colorId === c.id ? 'border-brand scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div className="mt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          {filtered.length} products
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold lg:hidden dark:border-white/10"
          >
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-void-3"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="glass sticky top-28 rounded-[2rem] p-6">{filterPanel}</div>
        </aside>

        <div>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((product, i) => {
              const color = colorId !== 'all' ? TEE_COLORS.find((c) => c.id === colorId)! : productColor(product.slug)
              const rating = 4.7 + (i % 3) * 0.1
              const wished = wishlist.includes(product.slug)
              return (
                <motion.article
                  key={product.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group glass glass-hover overflow-hidden rounded-[1.5rem]"
                >
                  <Link href={`/shop/${product.slug}`} className="block overflow-hidden">
                    {product.image ? (
                      <div
                        className="relative aspect-square w-full overflow-hidden"
                        style={{ backgroundColor: product.surface || '#f4f4f4' }}
                      >
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="scale-[1.25] object-contain transition duration-500 group-hover:scale-[1.32]"
                          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="transition duration-500 group-hover:scale-[1.03]">
                        <PlainTeeMockup
                          fill={color.hex}
                          text=""
                          textColor={color.textColor}
                          className="w-full"
                        />
                      </div>
                    )}
                  </Link>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/shop/${product.slug}`}>
                          <h2 className="font-display text-lg font-semibold hover:text-brand">
                            {product.title}
                          </h2>
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                        <p className="mt-1 text-sm">★ {rating.toFixed(1)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.slug)}
                        className={`rounded-full p-2 text-lg ${wished ? 'text-red-500' : 'opacity-50'}`}
                        aria-label="Wishlist"
                      >
                        {wished ? '♥' : '♡'}
                      </button>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="font-display text-2xl font-bold">₹{product.price}</p>
                      {product.compareAt ? (
                        <p className="text-sm text-slate-400 line-through">₹{product.compareAt}</p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex gap-1">
                      {TEE_COLORS.slice(0, 5).map((c) => (
                        <span
                          key={c.id}
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setQuickView(product)}
                        className="rounded-full bg-black/5 py-2.5 dark:bg-white/10"
                      >
                        Quick View
                      </button>
                      <Link
                        href={`/design?product=${product.slug}`}
                        className="rounded-full bg-brand py-2.5 text-center text-white"
                      >
                        Customize
                      </Link>
                      <button
                        type="button"
                        onClick={() => setQuickView(product)}
                        className="rounded-full bg-slate-900 py-2.5 text-white dark:bg-white dark:text-slate-900"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>

          {totalPages > 1 ? (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-10 w-10 rounded-full text-sm font-bold ${
                    page === p ? 'bg-brand text-white' : 'glass'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {mobileFilters ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setMobileFilters(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-[min(320px,90vw)] overflow-y-auto bg-white p-6 dark:bg-void-2"
            >
              <motion.div className="mb-6 flex items-center justify-between">
                <p className="font-bold">Filters</p>
                <button type="button" onClick={() => setMobileFilters(false)}>
                  ✕
                </button>
              </motion.div>
              {filterPanel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {quickView ? <QuickViewModal product={quickView} onClose={() => setQuickView(null)} /> : null}
    </motion.div>
  )
}
