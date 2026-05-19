'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Phone, Mail, Trash2, X, Truck } from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminBulkOrder } from '@/store/useAdminStore'

const STATUSES = ['all', 'new', 'quoted', 'won', 'lost'] as const

export default function BulkOrdersPage() {
  const items = useAdminStore((s) => s.bulkOrders)
  const updateStatus = useAdminStore((s) => s.updateBulkOrderStatus)
  const remove = useAdminStore((s) => s.deleteBulkOrder)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [q, setQ] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all')
  const [open, setOpen] = useState(false)

  const data = useMemo(() => {
    return items.filter((b) => {
      if (status !== 'all' && b.status !== status) return false
      if (q && !`${b.company} ${b.contactName} ${b.city}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [items, q, status])

  function handleDelete(id: string, company: string) {
    if (confirm(`Delete inquiry from "${company}"?`)) remove(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Bulk Orders"
        subtitle="Company inquiries — quote and follow up."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Inquiry
          </button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search company, contact, city..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  status === s
                    ? 'bg-brand text-white shadow'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {hydrated && data.length === 0 ? (
          <div className="mt-10 grid place-items-center py-10 text-center">
            <Truck className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No bulk inquiries yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Inquiries from the public Bulk Order form land here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center ring-1 ring-slate-200 dark:ring-white/10"
                      style={{
                        backgroundImage: b.logoUrl ? `url(${b.logoUrl})` : undefined,
                        backgroundColor: b.logoUrl ? undefined : '#f1f5f9',
                      }}
                    />
                    <div>
                      <p className="font-display text-base font-bold">{b.company}</p>
                      <p className="text-xs text-slate-500">
                        {b.city} · {b.createdAt.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="text-slate-500">Contact: </span>
                    <span className="font-bold">{b.contactName}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> {b.phone}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5" /> {b.email}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/[0.03]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Quantity</p>
                    <p className="mt-1 font-bold">{b.quantity.toLocaleString('en-IN')} pcs</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Printing</p>
                    <p className="mt-1 font-bold">{b.printingType}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value as AdminBulkOrder['status'])}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-slate-950"
                  >
                    {STATUSES.filter((s) => s !== 'all').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.company)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {open ? <BulkOrderForm onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

function BulkOrderForm({ onClose }: { onClose: () => void }) {
  const add = useAdminStore((s) => s.addBulkOrder)
  const [company, setCompany] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [quantity, setQuantity] = useState('')
  const [printingType, setPrintingType] = useState('Screen Print')
  const [logoUrl, setLogoUrl] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<AdminBulkOrder['status']>('new')

  function handleSave() {
    if (!company.trim() || !contactName.trim() || !quantity) return
    add({
      company: company.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      quantity: Number(quantity),
      printingType,
      logoUrl: logoUrl.trim() || undefined,
      note: note.trim() || undefined,
      status,
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
          <h3 className="font-display text-xl font-bold">New bulk inquiry</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company *</label>
            <input className={cls} value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact name *</label>
            <input className={cls} value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
            <input type="email" className={cls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
            <input className={cls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
            <input className={cls} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity *</label>
            <input type="number" min={1} className={cls} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Printing type</label>
            <select className={cls} value={printingType} onChange={(e) => setPrintingType(e.target.value)}>
              <option>Screen Print</option>
              <option>DTG Print</option>
              <option>Embroidery</option>
              <option>Sublimation</option>
              <option>Screen + Embroidery</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
            <select className={cls} value={status} onChange={(e) => setStatus(e.target.value as AdminBulkOrder['status'])}>
              {STATUSES.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Logo URL</label>
            <input className={cls} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
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
            Create inquiry
          </button>
        </div>
      </motion.div>
    </div>
  )
}
