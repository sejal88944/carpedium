'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Tag } from 'lucide-react'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'
import { TEE_COLORS } from '@/data/brand'
import { useCart, cartTotal } from '@/store/useCart'
import { useAdminStore } from '@/store/useAdminStore'
import { openWhatsAppOrder } from '@/lib/whatsappOrder'
import { downloadCartPdf } from '@/lib/designPdf'
import { buildAvailableCoupons, resolveCoupon } from '@/lib/coupons'

const SHIPPING_FLAT = 99
const FREE_SHIPPING_MIN = 1500

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function itemColor(item: { color?: string; imageTone?: string }) {
  if (item.color) {
    const found = TEE_COLORS.find((c) => c.id === item.color || c.name === item.color)
    if (found) return found
  }
  return TEE_COLORS[0]
}

export function CartView() {
  const { items, remove, updateQty, coupon, setCoupon, clear } = useCart()
  const adminCoupons = useAdminStore((s) => s.coupons)
  const addOrder = useAdminStore((s) => s.addOrder)
  const upsertCustomer = useAdminStore((s) => s.upsertCustomer)
  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg] = useState<{ kind: 'success' | 'warn' | 'error'; text: string } | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerError, setCustomerError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('aasha-customer')
      if (!raw) return
      const data = JSON.parse(raw) as { name?: string; phone?: string; email?: string; address?: string }
      if (data.name) setCustomerName(data.name)
      if (data.phone) setCustomerPhone(data.phone)
      if (data.email) setCustomerEmail(data.email)
      if (data.address) setCustomerAddress(data.address)
    } catch {
      /* ignore */
    }
  }, [])

  const subtotal = cartTotal(items)

  // Resolve and validate every visible coupon against the current subtotal.
  const couponList = useMemo(
    () => buildAvailableCoupons(adminCoupons, subtotal),
    [adminCoupons, subtotal],
  )

  // Resolve the *currently applied* coupon — re-validates on every cart change,
  // so removing an item that drops the subtotal below min-order auto-clears
  // the discount instead of silently giving an invalid total.
  const appliedCoupon = useMemo(
    () => (coupon ? resolveCoupon(coupon, adminCoupons, subtotal) : null),
    [coupon, adminCoupons, subtotal],
  )

  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0
  const afterDiscount = subtotal - discount
  const shipping = items.length === 0 ? 0 : afterDiscount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT
  const total = afterDiscount + shipping

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items])

  // If the applied coupon goes invalid (e.g. customer removed items), drop it.
  useEffect(() => {
    if (coupon && appliedCoupon && !appliedCoupon.valid) {
      setCoupon(null)
      setCouponMsg({ kind: 'warn', text: `Coupon removed — ${appliedCoupon.reason}` })
    }
  }, [coupon, appliedCoupon, setCoupon])

  // Sync the input field when a coupon is applied externally.
  useEffect(() => {
    if (coupon && appliedCoupon?.valid) {
      setCouponInput(coupon)
      setCouponMsg({ kind: 'success', text: `${appliedCoupon.label} applied — ${appliedCoupon.coupon.code}` })
    }
  }, [coupon, appliedCoupon])

  /** Manual apply via the input box. */
  const applyCoupon = () => {
    const code = couponInput.trim()
    if (!code) {
      setCoupon(null)
      setCouponMsg(null)
      return
    }
    const view = resolveCoupon(code, adminCoupons, subtotal)
    if (!view) {
      setCoupon(null)
      setCouponMsg({ kind: 'error', text: 'Invalid coupon code' })
      return
    }
    if (view.state === 'dead') {
      setCoupon(null)
      setCouponMsg({ kind: 'error', text: view.reason })
      return
    }
    if (view.state === 'eligible-soon') {
      setCoupon(null)
      setCouponMsg({ kind: 'warn', text: view.reason })
      return
    }
    setCoupon(view.coupon.code)
    setCouponMsg({ kind: 'success', text: `${view.label} applied — ${view.coupon.code}` })
  }

  /** One-tap apply from a chip. Disabled chips never reach this handler. */
  const applyCouponCode = (code: string) => {
    setCouponInput(code)
    const view = resolveCoupon(code, adminCoupons, subtotal)
    if (!view || !view.valid) return
    setCoupon(view.coupon.code)
    setCouponMsg({ kind: 'success', text: `${view.label} applied — ${view.coupon.code}` })
  }

  /** Build cart PDF + open WhatsApp with full price details. Also records the order
   *  in the admin store and upserts the customer so the business has a paper trail. */
  const handleOrderOnWhatsApp = () => {
    const name = customerName.trim()
    const phone = customerPhone.trim()
    const email = customerEmail.trim()
    const addr = customerAddress.trim()
    if (!name || !phone) {
      setCustomerError('Name ani phone tako, mg WhatsApp open hoil.')
      return
    }
    if (!addr) {
      setCustomerError('Delivery patta (address) tak — order confirm ani ship sathi lagto.')
      return
    }
    setCustomerError('')

    const code = `ORD-${Date.now().toString(36).toUpperCase()}`

    try {
      window.localStorage.setItem(
        'aasha-customer',
        JSON.stringify({ name, phone, email, address: addr || undefined }),
      )
    } catch {
      /* ignore */
    }

    const pricing = {
      subtotal,
      discount: discount || undefined,
      discountLabel:
        discount && appliedCoupon
          ? `Discount (${appliedCoupon.coupon.code})`
          : undefined,
      shipping,
      total,
    }
    let pdfFileName: string | undefined
    try {
      pdfFileName = downloadCartPdf(
        items.map((i) => ({
          id: i.id,
          title: i.title,
          qty: i.qty,
          price: i.price,
          size: i.size,
          color: i.color,
          previewImage: i.previewImage,
          slug: i.slug,
          printArtwork: i.printArtwork,
          printAspectRatio: i.printAspectRatio,
          printArtworkWidthPx: i.printArtworkWidthPx,
          printArtworkHeightPx: i.printArtworkHeightPx,
          printWidthMm: i.printWidthMm,
          printHeightMm: i.printHeightMm,
        })),
        {
          ...pricing,
          orderRef: code,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          customerAddress: addr || undefined,
        },
      )
    } catch (err) {
      console.error('cart pdf export failed', err)
    }

    const totalQty = items.reduce((n, i) => n + i.qty, 0)
    const productLabel =
      items.length === 1
        ? items[0].title
        : `${items[0].title} +${items.length - 1} more`
    const note = [
      appliedCoupon?.valid ? `Coupon: ${appliedCoupon.coupon.code}` : null,
      pdfFileName ? `PDF: ${pdfFileName}` : null,
      addr ? `Address: ${addr}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    try {
      addOrder({
        code,
        customer: name,
        email: email || undefined,
        phone,
        product: productLabel,
        qty: totalQty,
        total,
        status: 'confirmed',
        payment: 'pending',
        note: note || undefined,
      })
      upsertCustomer({
        name,
        email: email || '',
        phone,
        address: addr || undefined,
        addOrder: { total, at: new Date().toISOString() },
      })
    } catch (err) {
      console.error('failed to record order', err)
    }

    openWhatsAppOrder(items, {
      pdfFileName,
      pricing,
      customer: {
        name,
        phone,
        email: email || undefined,
        address: addr || undefined,
      },
    })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-auto max-w-lg rounded-3xl p-12 text-center"
        >
          <p className="text-5xl">🛒</p>
          <h2 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-slate-600 dark:text-zinc-400">
            Explore our premium tees and start customizing.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-8 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.03]"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-12 lg:px-8"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold text-slate-500 dark:text-zinc-400"
      >
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </motion.p>

      {/* Live offer strip — visible immediately after Add to Cart. */}
      {couponList.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-3 dark:border-amber-500/30 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-amber-500/10"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="h-4 w-4" /> Active offers:
          </span>
          {couponList.map((c) => {
            const isApplied =
              coupon?.toUpperCase() === c.coupon.code.toUpperCase() && c.valid
            const isEligibleSoon = c.state === 'eligible-soon'
            return (
              <button
                key={c.coupon.code}
                type="button"
                disabled={isEligibleSoon}
                title={c.reason || `Apply ${c.coupon.code}`}
                onClick={() => applyCouponCode(c.coupon.code)}
                className={`relative inline-flex items-center gap-2 rounded-full border-2 border-dashed px-3 py-1 text-xs font-bold transition ${
                  isApplied
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : c.valid
                      ? 'border-amber-400 bg-white text-amber-700 hover:scale-105 dark:bg-amber-500/10 dark:text-amber-300'
                      : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500 opacity-80 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400'
                }`}
              >
                {c.isBest && !isApplied ? (
                  <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow">
                    Best
                  </span>
                ) : null}
                <span className="font-mono tracking-wider">{c.coupon.code}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                    c.valid ? 'bg-amber-500/20' : 'bg-slate-300/60 dark:bg-white/10'
                  }`}
                >
                  {c.label}
                </span>
                {isApplied ? <span className="ml-1">✓</span> : null}
              </button>
            )
          })}
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const color = itemColor(item)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  className="glass glass-hover flex gap-4 overflow-hidden rounded-2xl p-4 md:gap-6 md:p-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl md:h-32 md:w-28"
                    style={item.previewImage ? { background: '#ffffff' } : undefined}
                  >
                    {item.previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewImage}
                        alt={item.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <PlainTeeMockup
                        fill={color.hex}
                        text={item.title}
                        textColor={color.textColor}
                        size="sm"
                        className="h-full w-full"
                      />
                    )}
                    {item.previewImage ? (
                      <span className="absolute left-1 top-1 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                        Custom
                      </span>
                    ) : null}
                  </motion.div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        Size {item.size}
                        {item.color ? ` · ${item.color}` : ''}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/60 p-1 dark:border-white/10 dark:bg-void-3">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-display text-lg font-bold text-brand">
                        {formatInr(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="self-start rounded-full px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/shop"
              className="glass glass-hover rounded-full px-6 py-2.5 text-sm font-semibold transition hover:scale-[1.02]"
            >
              ← Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clear}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:text-red-500"
            >
              Clear cart
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6"
            >
              {couponList.length > 0 ? (
                <div className="mb-4 rounded-2xl border border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" /> Available coupons
                  </p>
                  <div className="mt-3 space-y-2">
                    {couponList.map((c) => {
                      const isApplied =
                        coupon?.toUpperCase() === c.coupon.code.toUpperCase() && c.valid
                      const isEligibleSoon = c.state === 'eligible-soon'
                      return (
                        <button
                          key={c.coupon.code}
                          type="button"
                          disabled={isEligibleSoon}
                          onClick={() => applyCouponCode(c.coupon.code)}
                          className={`relative flex w-full items-center justify-between gap-3 rounded-xl border-2 border-dashed px-3 py-2.5 text-left transition ${
                            isApplied
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                              : c.valid
                                ? 'border-amber-300 bg-white/70 hover:border-amber-500 hover:bg-white dark:border-amber-500/30 dark:bg-amber-500/5 dark:hover:bg-amber-500/10'
                                : 'cursor-not-allowed border-slate-300 bg-slate-100/70 dark:border-white/10 dark:bg-white/5'
                          }`}
                        >
                          {c.isBest && !isApplied ? (
                            <span className="absolute -top-2 left-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                              Best deal
                            </span>
                          ) : null}
                          <span className="flex min-w-0 items-center gap-2">
                            <Tag
                              className={`h-4 w-4 shrink-0 ${
                                c.valid
                                  ? 'text-amber-600 dark:text-amber-300'
                                  : 'text-slate-400 dark:text-zinc-500'
                              }`}
                            />
                            <span className="min-w-0">
                              <span className="block font-mono text-sm font-bold tracking-wider">
                                {c.coupon.code}
                              </span>
                              <span
                                className={`block truncate text-[11px] ${
                                  c.valid
                                    ? 'text-slate-500 dark:text-zinc-400'
                                    : 'text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {c.valid ? c.subtitle : c.reason}
                              </span>
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              isApplied
                                ? 'bg-emerald-500 text-white'
                                : c.valid
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-amber-300/60 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
                            }`}
                          >
                            {isApplied
                              ? 'Applied'
                              : c.valid
                                ? `Save ₹${c.discount.toLocaleString('en-IN')}`
                                : c.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <label htmlFor="coupon" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Have another code?
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Apply
                </button>
              </div>
              {couponMsg ? (
                <p
                  className={`mt-2 text-xs font-semibold ${
                    couponMsg.kind === 'success'
                      ? 'text-emerald-500'
                      : couponMsg.kind === 'warn'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-500'
                  }`}
                >
                  {couponMsg.text}
                </p>
              ) : null}
            </motion.div>

            <dl className="mt-6 space-y-3 border-t border-black/5 pt-6 text-sm dark:border-white/10">
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-zinc-400">Subtotal</dt>
                <dd className="font-semibold">{formatInr(subtotal)}</dd>
              </div>
              {discount > 0 && appliedCoupon ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <dt>
                    Discount ({appliedCoupon.coupon.code})
                  </dt>
                  <dd className="font-semibold">−{formatInr(discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-600 dark:text-zinc-400">Shipping estimate</dt>
                <dd className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-500">Free</span>
                  ) : (
                    formatInr(shipping)
                  )}
                </dd>
              </div>
              {afterDiscount < FREE_SHIPPING_MIN && items.length > 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  Add {formatInr(FREE_SHIPPING_MIN - afterDiscount)} more for free shipping
                </p>
              ) : null}
              <div className="flex justify-between border-t border-black/5 pt-3 text-base dark:border-white/10">
                <dt className="font-display font-bold">Total</dt>
                <dd className="font-display text-xl font-bold text-gradient">{formatInr(total)}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-2 border-t border-black/5 pt-6 dark:border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Your details
              </p>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name *"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number *"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
              />
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
              />
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Delivery address *"
                required
                rows={3}
                className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-void-3"
              />
              {customerError ? (
                <p className="text-xs font-semibold text-red-500">{customerError}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleOrderOnWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Order on WhatsApp
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-zinc-500">
              Order PDF download honaar · WhatsApp la full price details auto-fill hotil
            </p>
          </div>
        </aside>
      </motion.div>
    </motion.div>
  )
}
