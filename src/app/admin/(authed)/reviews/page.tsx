'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, CheckCircle2, XCircle, Trash2, X } from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore } from '@/store/useAdminStore'

export default function ReviewsPage() {
  const reviews = useAdminStore((s) => s.reviews)
  const toggleApproval = useAdminStore((s) => s.toggleReviewApproval)
  const remove = useAdminStore((s) => s.deleteReview)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [open, setOpen] = useState(false)

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete review "${title}"?`)) remove(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        subtitle="Moderate customer reviews & ratings."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Review
          </button>
        }
      />

      {hydrated && reviews.length === 0 ? (
        <Card>
          <div className="grid place-items-center py-14 text-center">
            <Star className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No reviews yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Customer ratings & written reviews land here for moderation.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <StatusBadge status={r.approved ? 'approved' : 'pending'} />
                    </div>
                    {r.title ? <h3 className="mt-2 font-display text-lg font-bold">{r.title}</h3> : null}
                    {r.body ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{r.body}</p> : null}
                    <p className="mt-2 text-xs text-slate-500">
                      <span className="font-bold">{r.customerName}</span>
                      {r.productSlug ? ` · ${r.productSlug}` : ''} · {r.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleApproval(r.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                        r.approved
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      }`}
                    >
                      {r.approved ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {r.approved ? 'Hide' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.title || r.customerName)}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {open ? <ReviewForm onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

function ReviewForm({ onClose }: { onClose: () => void }) {
  const add = useAdminStore((s) => s.addReview)
  const [customerName, setCustomerName] = useState('')
  const [productSlug, setProductSlug] = useState('')
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [approved, setApproved] = useState(true)

  function handleSave() {
    if (!customerName.trim()) return
    add({
      customerName: customerName.trim(),
      productSlug: productSlug.trim() || undefined,
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
      approved,
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
          <h3 className="font-display text-xl font-bold">New review</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer *</label>
              <input className={cls} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product slug</label>
              <input className={cls} value={productSlug} onChange={(e) => setProductSlug(e.target.value)} placeholder="unvybed-boombox" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rating</label>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-6 w-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
            <input className={cls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Review</label>
            <textarea className={`${cls} min-h-[80px]`} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
            Approved (visible on storefront)
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            Create review
          </button>
        </div>
      </motion.div>
    </div>
  )
}
