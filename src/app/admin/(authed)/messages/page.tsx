'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Trash2, Search, MessageSquare, ExternalLink } from 'lucide-react'
import { AdminPageHeader, Card } from '@/components/admin/AdminUI'
import { useAdminStore } from '@/store/useAdminStore'
import { COMPANY } from '@/data/brand'

export default function MessagesPage() {
  const messages = useAdminStore((s) => s.messages)
  const remove = useAdminStore((s) => s.deleteMessage)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [q, setQ] = useState('')

  const data = useMemo(() => {
    if (!q) return messages
    const t = q.toLowerCase()
    return messages.filter((m) =>
      `${m.name} ${m.email} ${m.phone || ''} ${m.body}`.toLowerCase().includes(t),
    )
  }, [messages, q])

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete message from "${name}"?`)) remove(id)
  }

  function waLink(phone?: string) {
    if (!phone) return `https://wa.me/${COMPANY.whatsapp}`
    const digits = phone.replace(/\D/g, '')
    return `https://wa.me/${digits.length >= 10 ? digits : COMPANY.whatsapp}`
  }

  return (
    <div>
      <AdminPageHeader
        title="Contact Messages"
        subtitle="Inquiries from the public Contact form land here."
      />

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, message..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
            />
          </div>
          <p className="text-xs text-slate-500">
            {hydrated ? `${messages.length} total` : ''}
          </p>
        </div>

        {hydrated && data.length === 0 ? (
          <div className="mt-10 grid place-items-center py-10 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No messages yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              When customers send a message via the Contact page, it shows up here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.createdAt.slice(0, 10)} · {m.createdAt.slice(11, 16)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id, m.name)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand dark:text-slate-400"
                  >
                    <Mail className="h-3.5 w-3.5" /> {m.email}
                  </a>
                  {m.phone ? (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-2 text-slate-600 hover:text-brand dark:text-slate-400"
                    >
                      <Phone className="h-3.5 w-3.5" /> {m.phone}
                    </a>
                  ) : null}
                </div>

                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-white/[0.03] dark:text-slate-300">
                  {m.body}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={waLink(m.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-90"
                  >
                    <ExternalLink className="h-3 w-3" /> Reply on WhatsApp
                  </a>
                  <a
                    href={`mailto:${m.email}?subject=Re: Your inquiry to ${COMPANY.shortName}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <Mail className="h-3 w-3" /> Reply by Email
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
