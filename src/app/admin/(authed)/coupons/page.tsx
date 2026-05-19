'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Copy, Trash2, X, Ticket, Power } from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminCoupon } from '@/store/useAdminStore'

export default function CouponsPage() {
  const coupons = useAdminStore((s) => s.coupons)
  const deleteCoupon = useAdminStore((s) => s.deleteCoupon)
  const toggleCoupon = useAdminStore((s) => s.toggleCoupon)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [open, setOpen] = useState(false)

  function handleDelete(id: string, code: string) {
    if (confirm(`Delete coupon ${code}?`)) deleteCoupon(id)
  }

  function copyCode(code: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(code)
  }

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        subtitle="Create discount codes — percent / flat, with expiry & usage limits."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Coupon
          </button>
        }
      />

      {hydrated && coupons.length === 0 ? (
        <Card>
          <div className="grid place-items-center py-14 text-center">
            <Ticket className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No coupons yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Create your first coupon to run a campaign — percent or flat discount, expiry date, usage limit.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Create coupon
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wider">{c.code}</p>
                      <p className="text-xs text-slate-500">
                        {c.discountType === 'percent' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                        {c.minOrder ? ` · Min ₹${c.minOrder}` : ''}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.active ? 'active' : 'expired'} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/[0.03]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Used</p>
                    <p className="mt-1 font-bold">
                      {c.usedCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Expires</p>
                    <p className="mt-1 font-bold">{c.expiresAt || '—'}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyCode(c.code)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCoupon(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-brand dark:border-white/10"
                    aria-label="Toggle active"
                  >
                    <Power className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.code)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {open ? <CouponForm onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

function CouponForm({ onClose }: { onClose: () => void }) {
  const addCoupon = useAdminStore((s) => s.addCoupon)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<AdminCoupon['discountType']>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  function handleSubmit() {
    if (!code.trim() || !discountValue) return
    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: minOrder ? Number(minOrder) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      expiresAt: expiresAt || undefined,
      active: true,
    })
    onClose()
  }

  const cls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-bold">New coupon</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Code *</label>
            <input className={cls} value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discount type</label>
              <select
                className={cls}
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as AdminCoupon['discountType'])}
              >
                <option value="percent">percent</option>
                <option value="flat">flat</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discount value *</label>
              <input
                type="number"
                min={0}
                className={cls}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min order (₹)</label>
              <input type="number" min={0} className={cls} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="499" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Usage limit</label>
              <input type="number" min={0} className={cls} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry</label>
              <input type="date" className={cls} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            Create coupon
          </button>
        </div>
      </motion.div>
    </div>
  )
}
