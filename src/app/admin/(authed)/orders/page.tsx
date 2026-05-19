'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, FileText, Eye, X, Trash2, Package } from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminOrder, type OrderStatus } from '@/store/useAdminStore'

const STATUSES = ['all', 'confirmed', 'printing', 'quality-check', 'packed', 'shipped', 'delivered', 'cancelled'] as const
const PER_PAGE = 10

export default function OrdersPage() {
  const orders = useAdminStore((s) => s.orders)
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus)
  const deleteOrder = useAdminStore((s) => s.deleteOrder)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all')
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<AdminOrder | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (q && !`${o.code} ${o.customer} ${o.product}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [orders, q, status])

  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  function handleDelete(id: string, code: string) {
    if (confirm(`Delete order #${code}?`)) {
      deleteOrder(id)
      setActive(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="View, search, filter and update order statuses."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> Add Order
            </button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              placeholder="Search by order code, customer, product..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s)
                  setPage(1)
                }}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  status === s
                    ? 'bg-brand text-white shadow'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {hydrated && pageData.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                  <th className="pb-3 pr-3 font-bold">Order</th>
                  <th className="pb-3 pr-3 font-bold">Customer</th>
                  <th className="pb-3 pr-3 font-bold">Product</th>
                  <th className="pb-3 pr-3 font-bold">Qty</th>
                  <th className="pb-3 pr-3 font-bold">Total</th>
                  <th className="pb-3 pr-3 font-bold">Payment</th>
                  <th className="pb-3 pr-3 font-bold">Status</th>
                  <th className="pb-3 pr-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0 dark:border-white/5 dark:hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-3 font-mono text-xs font-bold">#{o.code}</td>
                    <td className="py-3 pr-3">{o.customer}</td>
                    <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{o.product}</td>
                    <td className="py-3 pr-3">{o.qty}</td>
                    <td className="py-3 pr-3 font-bold">₹{o.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-3"><StatusBadge status={o.payment} /></td>
                    <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActive(o)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-white/5"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-white/5"
                          aria-label="Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id, o.code)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/5"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid place-items-center py-12 text-center">
              <Package className="h-12 w-12 text-slate-300" />
              <p className="mt-4 font-display text-lg font-bold">
                {hydrated ? 'No orders found' : 'Loading...'}
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {hydrated ? 'Add an order manually or wait for one to come in.' : ''}
              </p>
            </div>
          )}
        </div>

        {filtered.length > PER_PAGE ? (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold">{pageData.length}</span> of{' '}
              <span className="font-bold">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-50 dark:border-white/10"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-50 dark:border-white/10"
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      {creating ? <OrderForm onClose={() => setCreating(false)} /> : null}

      {active ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur" onClick={() => setActive(null)}>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl font-bold">Order #{active.code}</h3>
            <p className="mt-1 text-sm text-slate-500">{active.createdAt.slice(0, 10)}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</p>
                <p className="mt-2 font-bold">{active.customer}</p>
                {active.email ? <p className="text-xs text-slate-500">{active.email}</p> : null}
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment</p>
                <p className="mt-2"><StatusBadge status={active.payment} /></p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2 dark:border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product</p>
                <p className="mt-2 font-bold">{active.product}</p>
                <p className="text-sm text-slate-500">Qty: {active.qty} · ₹{active.total.toLocaleString('en-IN')}</p>
                {active.note ? <p className="mt-2 text-sm">{active.note}</p> : null}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Update status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== 'all').map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      updateOrderStatus(active.id, s as OrderStatus)
                      setActive({ ...active, status: s as OrderStatus })
                    }}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                      active.status === s
                        ? 'bg-brand text-white'
                        : 'border border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDelete(active.id, active.code)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 dark:border-rose-500/30 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete order
              </button>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}

function OrderForm({ onClose }: { onClose: () => void }) {
  const addOrder = useAdminStore((s) => s.addOrder)
  const [code, setCode] = useState('')
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [product, setProduct] = useState('')
  const [qty, setQty] = useState('1')
  const [total, setTotal] = useState('')
  const [status, setStatus] = useState<OrderStatus>('confirmed')
  const [payment, setPayment] = useState<AdminOrder['payment']>('paid')
  const [note, setNote] = useState('')

  function handleSave() {
    if (!customer.trim() || !product.trim() || !total) return
    addOrder({
      code: code.trim() || `AST-${Math.floor(Math.random() * 90000 + 10000)}`,
      customer: customer.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      product: product.trim(),
      qty: Number(qty) || 1,
      total: Number(total),
      status,
      payment,
      note: note.trim() || undefined,
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
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-bold">New order</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order code</label>
            <input className={cls} value={code} onChange={(e) => setCode(e.target.value)} placeholder="AST-12345 (auto)" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer name *</label>
            <input className={cls} value={customer} onChange={(e) => setCustomer(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
            <input type="email" className={cls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
            <input className={cls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product *</label>
            <input className={cls} value={product} onChange={(e) => setProduct(e.target.value)} required placeholder="UNVYBED Boombox Tee" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity</label>
            <input type="number" min={1} className={cls} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Total (₹) *</label>
            <input type="number" min={0} className={cls} value={total} onChange={(e) => setTotal(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
            <select className={cls} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              {STATUSES.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment</label>
            <select className={cls} value={payment} onChange={(e) => setPayment(e.target.value as AdminOrder['payment'])}>
              <option value="paid">paid</option>
              <option value="pending">pending</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Note</label>
            <textarea className={`${cls} min-h-[70px]`} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            Create order
          </button>
        </div>
      </motion.div>
    </div>
  )
}
