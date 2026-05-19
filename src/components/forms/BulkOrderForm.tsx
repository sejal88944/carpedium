'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { COMPANY } from '@/data/brand'
import { FABRICS, PRINT_METHODS } from '@/data/site'
import { useAdminStore } from '@/store/useAdminStore'

const inputClass =
  'w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-white/10 dark:bg-void-3'

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <motion.div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
    </motion.div>
  )
}

export function BulkOrderForm() {
  const addBulkOrder = useAdminStore((s) => s.addBulkOrder)
  const upsertCustomer = useAdminStore((s) => s.upsertCustomer)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [qty, setQty] = useState('')
  const [city, setCity] = useState('')
  const [fabric, setFabric] = useState(FABRICS[0].name)
  const [printMethod, setPrintMethod] = useState(PRINT_METHODS[0].name)
  const [details, setDetails] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !qty) return

    addBulkOrder({
      company: name.trim(),
      contactName: name.trim(),
      email: '',
      phone: phone.trim(),
      city: city.trim() || '—',
      quantity: Number(qty),
      printingType: `${printMethod} · ${fabric}`,
      note: details.trim() || undefined,
      status: 'new',
    })

    upsertCustomer({
      name: name.trim(),
      email: '',
      phone: phone.trim(),
      city: city.trim() || undefined,
    })

    setSent(true)
    setName('')
    setPhone('')
    setQty('')
    setCity('')
    setDetails('')
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-[2rem] border border-black/5 p-8 shadow-xl dark:border-white/5 md:p-10"
      onSubmit={handleSubmit}
    >
      <motion.div className="mb-6">
        <h3 className="font-display text-2xl font-bold">Request a bulk quote</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          Minimum 25 pieces · Free design support · Response within 24 hours
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name / Company">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or company"
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91"
            className={inputClass}
          />
        </Field>
        <Field label="Quantity">
          <input
            required
            type="number"
            min={25}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="e.g. 100"
            className={inputClass}
          />
        </Field>
        <Field label="Delivery city">
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Pune, Mumbai..."
            className={inputClass}
          />
        </Field>
        <Field label="Fabric">
          <select className={inputClass} value={fabric} onChange={(e) => setFabric(e.target.value)}>
            {FABRICS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} — {f.desc}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Print method">
          <select className={inputClass} value={printMethod} onChange={(e) => setPrintMethod(e.target.value)}>
            {PRINT_METHODS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} — {p.desc}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Project details">
          <textarea
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Sizes, colours, design notes, target delivery date..."
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02]"
        >
          Get bulk quote
        </button>
        <Link
          href={`https://wa.me/${COMPANY.whatsapp}?text=Hi%2C%20I%20need%20a%20bulk%20t-shirt%20quote`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border-2 border-emerald-500/50 px-6 py-3 text-center text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          WhatsApp for faster reply
        </Link>
      </div>

      <AnimatePresence>
        {sent ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Quote request received! We will call you soon. For instant support, WhatsApp {COMPANY.phone}.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.form>
  )
}
