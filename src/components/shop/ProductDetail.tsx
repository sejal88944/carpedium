'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStorefrontProducts } from '@/store/adminSeed'
import { COMPANY, TEE_COLORS } from '@/data/brand'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { useCart } from '@/store/useCart'
import { useAdminStore } from '@/store/useAdminStore'
import { openWhatsAppOrder } from '@/lib/whatsappOrder'

const TABS = ['Description', 'Printing', 'Reviews'] as const

const PRINTING_DETAILS = [
  'DTG & screen print ready — crisp logos on cotton and blends',
  'Upload PNG (transparent) or vector AI/PDF for best results',
  'Front, back & sleeve placement with live preview in Design Studio',
  'Bulk pricing from 25+ pieces — corporate colour matching available',
]

function productColorIndex(slug: string) {
  return slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % TEE_COLORS.length
}

function productRating(slug: string) {
  const i = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 4.7 + (i % 3) * 0.1
}

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter()
  const catalog = useStorefrontProducts()
  const product = useMemo(() => catalog.find((p) => p.slug === slug), [catalog, slug])
  const { add, addRecentlyViewed, toggleWishlist, wishlist } = useCart()
  const adminReviews = useAdminStore((s) => s.reviews)
  const addReview = useAdminStore((s) => s.addReview)
  const productReviews = useMemo(
    () => adminReviews.filter((r) => r.approved && (!r.productSlug || r.productSlug === slug)),
    [adminReviews, slug],
  )

  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewName.trim() || !reviewBody.trim()) return
    addReview({
      productSlug: slug,
      customerName: reviewName.trim(),
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      body: reviewBody.trim(),
    })
    setReviewName('')
    setReviewTitle('')
    setReviewBody('')
    setReviewRating(5)
    setReviewSubmitted(true)
  }

  const [colorIdx, setColorIdx] = useState(() => (product ? productColorIndex(product.slug) : 0))
  const [size, setSize] = useState(product?.sizes[Math.min(1, (product?.sizes.length ?? 1) - 1)] ?? 'M')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Description')

  const color = TEE_COLORS[colorIdx]
  const rating = product ? productRating(product.slug) : 4.8
  const wished = wishlist.includes(slug)

  useEffect(() => {
    addRecentlyViewed(slug)
  }, [slug, addRecentlyViewed])

  useEffect(() => {
    if (product) setSize(product.sizes[Math.min(1, product.sizes.length - 1)] ?? product.sizes[0])
  }, [product])

  const related = useMemo(() => {
    if (!product) return []
    const same = catalog.filter((p) => p.slug !== slug && p.category === product.category)
    const rest = catalog.filter((p) => p.slug !== slug && p.category !== product.category)
    return [...same, ...rest].slice(0, 4)
  }, [catalog, product, slug])

  if (!product) return null

  const cartPayload = {
    slug: product.slug,
    title: product.title,
    price: product.price,
    qty,
    size,
    color: color.name,
    imageTone: product.imageTone,
  }

  const whatsappPayload = {
    slug: product.slug,
    title: product.title,
    price: product.price,
    qty,
    size,
    color: color.name,
  }

  const handleAdd = () => {
    add(cartPayload)
    openWhatsAppOrder([whatsappPayload])
  }

  const handleBuyNow = () => {
    add(cartPayload)
    openWhatsAppOrder([whatsappPayload])
    router.push(`/design?product=${product.slug}&color=${color.id}&size=${size}`)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop' },
          { label: product.category, href: '/shop' },
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass overflow-hidden rounded-[2rem]"
        >
          {product.image ? (
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[2rem]"
              style={{ backgroundColor: product.surface || '#f4f4f4' }}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                priority
                className="object-contain p-6"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          ) : (
            <PlainTeeMockup
              fill={color.hex}
              text=""
              textColor={color.textColor}
              size="lg"
              className="w-full rounded-t-[2rem] py-10"
            />
          )}
          <motion.div className="border-t border-black/5 p-6 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Color</p>
            <motion.div className="mt-3 flex flex-wrap gap-2">
              {TEE_COLORS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  title={c.name}
                  className={`h-10 w-10 rounded-full border-2 transition ${
                    colorIdx === i
                      ? 'scale-110 border-2 border-brand shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_0_0_6px_rgba(14,165,233,0.2)]'
                      : 'border-black/65 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] hover:border-black dark:border-white/55 dark:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)] dark:hover:border-white'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-[2rem] p-6 md:p-8"
        >
          <motion.div className="flex items-start justify-between gap-4">
            <motion.div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand">{product.category}</p>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{product.title}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                ★ {rating.toFixed(1)} · {COMPANY.reviewCount}+ reviews
              </p>
            </motion.div>
            <button
              type="button"
              onClick={() => toggleWishlist(slug)}
              className={`glass rounded-full p-3 text-xl ${wished ? 'text-red-500' : 'opacity-50'}`}
              aria-label="Wishlist"
            >
              {wished ? '♥' : '♡'}
            </button>
          </motion.div>

          <motion.div className="mt-6 flex flex-wrap items-baseline gap-3">
            <p className="font-display text-4xl font-bold">₹{product.price}</p>
            {product.compareAt ? (
              <p className="text-lg text-slate-400 line-through">₹{product.compareAt}</p>
            ) : null}
            {product.compareAt ? (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
                Save ₹{product.compareAt - product.price}
              </span>
            ) : null}
          </motion.div>

          <motion.div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Size</p>
            <motion.div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-[3rem] rounded-full px-4 py-2.5 text-sm font-bold transition ${
                    size === s ? 'bg-brand text-white' : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tee color</p>
            <select
              value={color.id}
              onChange={(e) => {
                const idx = TEE_COLORS.findIndex((c) => c.id === e.target.value)
                if (idx >= 0) setColorIdx(idx)
              }}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
            >
              {TEE_COLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div className="mt-6 flex items-center gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Quantity</p>
            <div className="flex items-center rounded-full bg-black/5 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg font-bold"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center font-bold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-lg font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </motion.div>

          <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 rounded-full bg-brand px-6 py-4 text-sm font-bold text-white shadow-glow"
            >
              Buy now
            </button>
            <Link
              href={`/design?product=${product.slug}&color=${color.id}&size=${size}`}
              className="rounded-full border border-brand/40 px-6 py-4 text-center text-sm font-bold text-brand transition hover:bg-brand/10"
            >
              Customize design →
            </Link>
          </motion.div>

          <motion.div className="mt-8 space-y-3 rounded-2xl bg-black/[0.03] p-5 dark:bg-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Delivery</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-zinc-400">
              <li>🚚 Pan-India shipping · {COMPANY.locations.slice(0, 4).join(', ')} & more</li>
              <li>📦 Standard 5–7 business days · express on request</li>
              <li>💳 COD available on select orders</li>
              <li>🕐 {COMPANY.hours}</li>
            </ul>
          </motion.div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold capitalize dark:bg-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 glass rounded-[2rem] p-6 md:p-8"
      >
        <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4 dark:border-white/10">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                tab === t ? 'bg-brand text-white' : 'bg-black/5 dark:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 prose prose-slate max-w-none dark:prose-invert"
        >
          {tab === 'Description' ? (
            <div className="space-y-4 text-slate-600 dark:text-zinc-400">
              <p className="text-lg leading-relaxed text-slate-800 dark:text-zinc-200">{product.description}</p>
              <p>
                Premium custom tee from {COMPANY.shortName} — ideal for {product.tags.join(', ')} merch,
                events, and brand drops. Available in {product.sizes.join(', ')} with professional print
                finishing.
              </p>
            </div>
          ) : null}

          {tab === 'Printing' ? (
            <ul className="space-y-3 text-slate-600 dark:text-zinc-400">
              {PRINTING_DETAILS.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-brand">✓</span>
                  {line}
                </li>
              ))}
            </ul>
          ) : null}

          {tab === 'Reviews' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div>
                  <p className="font-display text-xl font-semibold">Customer reviews</p>
                  <p className="mt-1 text-sm text-slate-500">
                    ★ {rating.toFixed(1)} average · Trusted by {COMPANY.reviewCount}+ customers
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand">
                  {productReviews.length} review{productReviews.length === 1 ? '' : 's'}
                </p>
              </div>

              {productReviews.length > 0 ? (
                <ul className="space-y-3">
                  {productReviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{r.customerName}</p>
                        <p className="text-brand">
                          {'★'.repeat(Math.min(5, Math.max(1, r.rating)))}
                        </p>
                      </div>
                      {r.title ? (
                        <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
                          {r.title}
                        </p>
                      ) : null}
                      {r.body ? (
                        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">{r.body}</p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-slate-500 dark:border-white/10">
                  No reviews yet — be the first to share your experience!
                </p>
              )}

              <form
                onSubmit={submitReview}
                className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <p className="font-display text-lg font-semibold">Write a review</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name *"
                    required
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
                  />
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {'★'.repeat(n)} ({n}/5)
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Headline (optional)"
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
                />
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product *"
                  required
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white"
                >
                  Submit review
                </button>
                {reviewSubmitted ? (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Thanks! Your review is awaiting approval.
                  </p>
                ) : null}
              </form>
            </div>
          ) : null}
        </motion.div>
      </motion.section>

      {related.length > 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="font-display text-2xl font-bold md:text-3xl">You may also like</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => {
              const rc = TEE_COLORS[productColorIndex(p.slug)]
              return (
                <motion.article
                  key={p.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass glass-hover overflow-hidden rounded-[1.5rem]"
                >
                  <Link href={`/shop/${p.slug}`} className="block">
                    {p.image ? (
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden"
                        style={{ backgroundColor: p.surface || '#f4f4f4' }}
                      >
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width:768px) 50vw, 25vw"
                        />
                      </div>
                    ) : (
                      <PlainTeeMockup
                        fill={rc.hex}
                        text=""
                        textColor={rc.textColor}
                        size="sm"
                        className="w-full"
                      />
                    )}
                    <motion.div className="p-4">
                      <h3 className="font-display font-semibold hover:text-brand">{p.title}</h3>
                      <p className="mt-1 font-display text-lg font-bold">₹{p.price}</p>
                    </motion.div>
                  </Link>
                </motion.article>
              )
            })}
          </div>
        </motion.section>
      ) : null}
    </motion.div>
  )
}
