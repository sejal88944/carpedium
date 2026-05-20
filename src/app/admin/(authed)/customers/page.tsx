'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Mail, Phone, MapPin, Trash2, X, Users } from 'lucide-react'
import { AdminPageHeader, Card } from '@/components/admin/AdminUI'
import { useAdminStore } from '@/store/useAdminStore'

export default function CustomersPage() {
  const customers = useAdminStore((s) => s.customers)
  const deleteCustomer = useAdminStore((s) => s.deleteCustomer)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const data = useMemo(
    () =>
      customers.filter((c) =>
        `${c.name} ${c.email} ${c.city || ''} ${c.address || ''}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [customers, q],
  )

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete customer "${name}"?`)) deleteCustomer(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle="Buyers across all orders & campaigns."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Customer
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
              placeholder="Search by name, email, address, city..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
            />
          </div>
          <p className="text-xs text-slate-500">
            Total: <span className="font-bold">{data.length}</span>
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          {hydrated && data.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                  <th className="pb-3 pr-3 font-bold">Customer</th>
                  <th className="pb-3 pr-3 font-bold">Contact</th>
                  <th className="pb-3 pr-3 font-bold">Address / city</th>
                  <th className="pb-3 pr-3 font-bold">Orders</th>
                  <th className="pb-3 pr-3 font-bold">Total spent</th>
                  <th className="pb-3 pr-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 last:border-0 dark:border-white/5"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-sm font-bold text-white">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold">{c.name}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                      {c.phone ? (
                        <p className="mt-0.5 flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 max-w-[220px]">
                      {c.address || c.city ? (
                        <span className="inline-flex items-start gap-1 text-slate-600 dark:text-slate-400">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span className="leading-snug">{c.address || c.city}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold">{c.ordersCount}</td>
                    <td className="py-3 pr-3 font-bold text-emerald-600">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/5"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="mt-4 font-display text-lg font-bold">
                {hydrated ? 'No customers yet' : 'Loading...'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {open ? <CustomerForm onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

function CustomerForm({ onClose }: { onClose: () => void }) {
  const add = useAdminStore((s) => s.addCustomer)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  function handleSave() {
    if (!name.trim() || !email.trim()) return
    add({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
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
          <h3 className="font-display text-xl font-bold">New customer</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
            <input className={cls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email *</label>
            <input type="email" className={cls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Address</label>
            <textarea
              className={`${cls} min-h-[72px]`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full delivery address (optional)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
              <input className={cls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
              <input className={cls} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            Create customer
          </button>
        </div>
      </motion.div>
    </div>
  )
}
