'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useStorefrontProducts } from '@/store/adminSeed'
import { PlainTeeMockup } from '@/components/tee/PlainTeeMockup'
import { TEE_COLORS } from '@/data/brand'
import { useCart } from '@/store/useCart'
import type { OrderStatus } from '@/types'

const TABS = [
  'Orders',
  'Wishlist',
  'Saved Designs',
  'Addresses',
  'Profile',
  'Notifications',
] as const

type Tab = (typeof TABS)[number]

type MockOrder = {
  id: string
  date: string
  status: OrderStatus
  total: number
  items: { title: string; qty: number; size: string }[]
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ASH-7F2K9A',
    date: '2026-05-12',
    status: 'delivered',
    total: 2697,
    items: [
      { title: 'Oversized Void Tee', qty: 2, size: 'L' },
      { title: 'Luxury Polo Classic', qty: 1, size: 'M' },
    ],
  },
  {
    id: 'ASH-3B8M1C',
    date: '2026-04-28',
    status: 'shipped',
    total: 1898,
    items: [{ title: 'Anime Neon Drop', qty: 2, size: 'XL' }],
  },
  {
    id: 'ASH-9D4P2E',
    date: '2026-04-15',
    status: 'printing',
    total: 4495,
    items: [
      { title: 'Corporate Brand Kit', qty: 5, size: 'L' },
      { title: 'Gym Performance Tee', qty: 1, size: 'M' },
    ],
  },
]

const MOCK_DESIGNS = [
  { id: 'd1', name: 'Startup Launch Tee', updated: '2026-05-10', color: TEE_COLORS[0] },
  { id: 'd2', name: 'College Fest 2026', updated: '2026-04-22', color: TEE_COLORS[6] },
]

const MOCK_ADDRESSES = [
  {
    id: 'a1',
    label: 'Home',
    name: 'Rahul Sharma',
    line: '42 Koregaon Park, Pune',
    pin: '411001',
    default: true,
  },
  {
    id: 'a2',
    label: 'Office',
    name: 'Rahul Sharma',
    line: 'Bandra Kurla Complex, Mumbai',
    pin: '400051',
    default: false,
  },
]

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-600',
  paid: 'bg-sky-500/15 text-sky-600',
  printing: 'bg-violet-500/15 text-violet-600',
  shipped: 'bg-blue-500/15 text-blue-600',
  delivered: 'bg-emerald-500/15 text-emerald-600',
  cancelled: 'bg-red-500/15 text-red-600',
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function productColor(slug: string) {
  const i = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return TEE_COLORS[i % TEE_COLORS.length]
}

export function AccountView() {
  const [tab, setTab] = useState<Tab>('Orders')
  const { wishlist, toggleWishlist } = useCart()
  const CATALOG = useStorefrontProducts()

  const wishlistProducts = useMemo(
    () => CATALOG.filter((p) => wishlist.includes(p.slug)),
    [CATALOG, wishlist],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t
                ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white shadow-glow'
                : 'glass text-slate-600 hover:text-brand dark:text-zinc-300'
            }`}
          >
            {t}
            {tab === t ? (
              <motion.span
                layoutId="account-tab"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-700"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-10"
        >
          {tab === 'Orders' && (
            <div className="space-y-4">
              {MOCK_ORDERS.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass glass-hover rounded-2xl p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-brand">{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-slate-600 dark:text-zinc-400">
                    {order.items.map((item) => (
                      <li key={`${order.id}-${item.title}`}>
                        {item.title} × {item.qty} · {item.size}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-display text-lg font-bold">{formatInr(order.total)}</p>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'Wishlist' &&
            (wishlistProducts.length === 0 ? (
              <motion.div className="glass rounded-3xl p-12 text-center">
                <p className="text-4xl">♡</p>
                <p className="mt-4 font-semibold">No saved items yet</p>
                <Link
                  href="/shop"
                  className="mt-6 inline-block text-sm font-bold text-brand hover:underline"
                >
                  Browse shop →
                </Link>
              </motion.div>
            ) : (
              <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlistProducts.map((p) => {
                  const color = productColor(p.slug)
                  return (
                    <motion.div
                      key={p.slug}
                      layout
                      className="glass glass-hover overflow-hidden rounded-2xl"
                    >
                      <PlainTeeMockup
                        fill={color.hex}
                        text={p.title}
                        textColor={color.textColor}
                        size="md"
                        className="aspect-square"
                      />
                      <div className="p-4">
                        <h3 className="font-display font-bold">{p.title}</h3>
                        <p className="mt-1 text-sm text-brand">{formatInr(p.price)}</p>
                        <div className="mt-4 flex gap-2">
                          <Link
                            href="/shop"
                            className="flex-1 rounded-full bg-brand py-2 text-center text-xs font-bold text-white"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(p.slug)}
                            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold dark:border-white/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ))}

          {tab === 'Saved Designs' && (
            <div className="grid gap-6 sm:grid-cols-2">
              {MOCK_DESIGNS.map((d) => (
                <div key={d.id} className="glass glass-hover overflow-hidden rounded-2xl">
                  <PlainTeeMockup
                    fill={d.color.hex}
                    text={d.name}
                    textColor={d.color.textColor}
                    size="md"
                  />
                  <div className="p-4">
                    <h3 className="font-display font-bold">{d.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">Updated {d.updated}</p>
                    <Link
                      href="/design"
                      className="mt-4 inline-block text-sm font-bold text-brand hover:underline"
                    >
                      Open in designer →
                    </Link>
                  </div>
                </div>
              ))}
              <Link
                href="/design"
                className="glass flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 p-6 text-center transition hover:border-brand"
              >
                <span className="text-3xl">+</span>
                <span className="mt-2 text-sm font-bold text-brand">New design</span>
              </Link>
            </div>
          )}

          {tab === 'Addresses' && (
            <div className="grid gap-4 md:grid-cols-2">
              {MOCK_ADDRESSES.map((addr) => (
                <div
                  key={addr.id}
                  className={`glass rounded-2xl p-5 ${addr.default ? 'ring-2 ring-brand/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand">
                      {addr.label}
                    </span>
                    {addr.default ? (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 font-semibold">{addr.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{addr.line}</p>
                  <p className="text-sm text-slate-500">PIN {addr.pin}</p>
                </div>
              ))}
              <button
                type="button"
                className="glass rounded-2xl border-2 border-dashed border-black/10 p-5 text-sm font-bold text-brand dark:border-white/10"
              >
                + Add address
              </button>
            </div>
          )}

          {tab === 'Profile' && (
            <form className="glass max-w-xl space-y-4 rounded-3xl p-6 md:p-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Full name
                </label>
                <input
                  defaultValue="Rahul Sharma"
                  className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="rahul@example.com"
                  className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-void-3"
                />
              </div>
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-8 py-3 text-sm font-bold text-white shadow-glow"
              >
                Save profile
              </button>
            </form>
          )}

          {tab === 'Notifications' && (
            <div className="glass max-w-xl space-y-4 rounded-3xl p-6">
              {[
                {
                  id: 'n1',
                  label: 'Order updates',
                  desc: 'Shipping, delivery & printing status',
                  on: true,
                },
                {
                  id: 'n2',
                  label: 'Promotions & offers',
                  desc: 'Coupons like WELCOME10 and bulk deals',
                  on: true,
                },
                {
                  id: 'n3',
                  label: 'Design tips',
                  desc: 'Weekly inspiration from our studio',
                  on: false,
                },
              ].map((n) => (
                <label
                  key={n.id}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/5 p-4 dark:border-white/10"
                >
                  <div>
                    <p className="font-semibold">{n.label}</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{n.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={n.on} className="h-5 w-5 accent-brand" />
                </label>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
