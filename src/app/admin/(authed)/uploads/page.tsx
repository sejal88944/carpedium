'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Trash2,
  Upload as UploadIcon,
  Image as ImageIcon,
  FileText,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminUpload } from '@/store/useAdminStore'

const TABS = ['all', 'logo', 'image', 'text'] as const
const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const

export default function UploadsPage() {
  const uploads = useAdminStore((s) => s.uploads)
  const setStatus = useAdminStore((s) => s.setUploadStatus)
  const remove = useAdminStore((s) => s.deleteUpload)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [tab, setTab] = useState<(typeof TABS)[number]>('all')
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]>('all')
  const [active, setActive] = useState<AdminUpload | null>(null)
  const [open, setOpen] = useState(false)

  const data = useMemo(() => {
    return uploads.filter((u) => {
      if (tab !== 'all' && u.type !== tab) return false
      if (statusTab !== 'all' && u.status !== statusTab) return false
      return true
    })
  }, [uploads, tab, statusTab])

  function handleDelete(id: string, label: string) {
    if (confirm(`Delete "${label}"?`)) {
      remove(id)
      setActive(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Customer Uploads"
        subtitle="Logos, custom images, text designs — preview, approve & download."
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Upload
          </button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Type:</p>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  tab === t
                    ? 'bg-brand text-white'
                    : 'border border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Status:</p>
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setStatusTab(t)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  statusTab === t
                    ? 'bg-brand text-white'
                    : 'border border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {hydrated && data.length === 0 ? (
        <Card>
          <div className="grid place-items-center py-14 text-center">
            <ImageIcon className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No uploads found</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Customer logos, images and text designs land here once submitted via the customizer.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((u, i) => {
            const waPhone = u.customerPhone?.replace(/\D/g, '')
            const waLink = waPhone && waPhone.length >= 10 ? `https://wa.me/${waPhone}` : undefined
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setActive(u)}
                  className="block aspect-[4/3] w-full bg-cover bg-center"
                  style={{
                    backgroundImage: u.url ? `url(${u.url})` : undefined,
                    backgroundColor: u.url ? '#ffffff' : '#f1f5f9',
                  }}
                  aria-label={`Preview ${u.label}`}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold leading-tight">{u.label}</p>
                    <StatusBadge status={u.status} />
                  </div>

                  {/* Customer */}
                  <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/[0.03]">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {u.customerName || 'Unknown customer'}
                    </p>
                    {u.customerPhone ? (
                      <a
                        href={`tel:${u.customerPhone}`}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-brand dark:text-slate-400"
                      >
                        <Phone className="h-3 w-3" /> {u.customerPhone}
                      </a>
                    ) : null}
                    {u.customerEmail ? (
                      <a
                        href={`mailto:${u.customerEmail}`}
                        className="flex items-center gap-1.5 truncate text-slate-600 hover:text-brand dark:text-slate-400"
                      >
                        <Mail className="h-3 w-3" /> {u.customerEmail}
                      </a>
                    ) : null}
                  </div>

                  {/* Order */}
                  {(u.color || u.size || u.quantity || u.price) ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 p-3 text-[11px] dark:border-white/5">
                      {u.color ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Color</p>
                          <p className="font-bold">{u.color}</p>
                        </div>
                      ) : null}
                      {u.size ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Size</p>
                          <p className="font-bold">{u.size}</p>
                        </div>
                      ) : null}
                      {u.quantity ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Qty</p>
                          <p className="font-bold">{u.quantity}</p>
                        </div>
                      ) : null}
                      {u.price ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total</p>
                          <p className="font-bold">
                            ₹{((u.quantity || 1) * u.price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {u.notes ? (
                    <p className="mt-2 text-[11px] italic text-slate-500">{u.notes}</p>
                  ) : null}

                  {/* PDF row */}
                  {u.pdfUrl ? (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs dark:border-rose-500/30 dark:bg-rose-500/10">
                      <span className="flex min-w-0 items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{u.pdfFileName || 'Design PDF'}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <a
                          href={u.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-7 w-7 place-items-center rounded-lg bg-white text-rose-600 hover:bg-rose-100 dark:bg-rose-500/20"
                          aria-label="View PDF"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={u.pdfUrl}
                          download={u.pdfFileName || 'design.pdf'}
                          className="grid h-7 w-7 place-items-center rounded-lg bg-white text-rose-600 hover:bg-rose-100 dark:bg-rose-500/20"
                          aria-label="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </span>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="mt-3 grid grid-cols-5 gap-1">
                    <button
                      type="button"
                      onClick={() => setActive(u)}
                      className="grid h-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                      aria-label="Preview image"
                      title="Preview image"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={u.url}
                      download
                      className="grid h-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"
                      aria-label="Download image"
                      title="Download image"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setStatus(u.id, 'approved')}
                      className="grid h-8 place-items-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30"
                      aria-label="Approve"
                      title="Approve"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(u.id, 'rejected')}
                      className="grid h-8 place-items-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/30"
                      aria-label="Reject"
                      title="Reject"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.label)}
                      className="grid h-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[11px] font-bold text-white hover:opacity-90"
                    >
                      <ExternalLink className="h-3 w-3" /> Message on WhatsApp
                    </a>
                  ) : null}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {open ? <UploadForm onClose={() => setOpen(false)} /> : null}

      {active ? (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur"
          onClick={() => setActive(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-3 top-3 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid gap-4 md:grid-cols-[1fr_280px]">
              <div
                className="grid place-items-center rounded-xl"
                style={{ background: '#ffffff' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.url}
                  alt={active.label}
                  className="max-h-[60vh] w-full rounded-xl object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-display text-lg font-bold">{active.label}</p>
                  <p className="text-xs text-slate-500">
                    {active.createdAt.slice(0, 10)} · {active.createdAt.slice(11, 16)}
                  </p>
                  <div className="mt-2"><StatusBadge status={active.status} /></div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.03]">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Customer</p>
                  <p className="mt-1 font-bold">{active.customerName || 'Unknown'}</p>
                  {active.customerPhone ? (
                    <a
                      href={`tel:${active.customerPhone}`}
                      className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand dark:text-slate-400"
                    >
                      <Phone className="h-3 w-3" /> {active.customerPhone}
                    </a>
                  ) : null}
                  {active.customerEmail ? (
                    <a
                      href={`mailto:${active.customerEmail}`}
                      className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-600 hover:text-brand dark:text-slate-400"
                    >
                      <Mail className="h-3 w-3" /> {active.customerEmail}
                    </a>
                  ) : null}
                </div>

                {(active.color || active.size || active.quantity || active.price) ? (
                  <div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Order</p>
                    <dl className="mt-2 space-y-1">
                      {active.color ? (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Color</dt>
                          <dd className="font-bold">{active.color}</dd>
                        </div>
                      ) : null}
                      {active.size ? (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Size</dt>
                          <dd className="font-bold">{active.size}</dd>
                        </div>
                      ) : null}
                      {active.quantity ? (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Quantity</dt>
                          <dd className="font-bold">{active.quantity}</dd>
                        </div>
                      ) : null}
                      {active.price ? (
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Unit price</dt>
                          <dd className="font-bold">₹{active.price}</dd>
                        </div>
                      ) : null}
                      {active.price ? (
                        <div className="flex justify-between border-t border-slate-200 pt-1 dark:border-white/10">
                          <dt className="font-bold">Total</dt>
                          <dd className="font-bold">
                            ₹{((active.quantity || 1) * active.price).toLocaleString('en-IN')}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}

                {active.notes ? (
                  <div className="rounded-xl border border-slate-200 p-3 text-xs italic text-slate-600 dark:border-white/10 dark:text-slate-400">
                    {active.notes}
                  </div>
                ) : null}

                <div className="space-y-2">
                  {active.pdfUrl ? (
                    <a
                      href={active.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Design PDF
                    </a>
                  ) : null}
                  {active.pdfUrl ? (
                    <a
                      href={active.pdfUrl}
                      download={active.pdfFileName || 'design.pdf'}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 dark:border-rose-500/30"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                  ) : null}
                  <a
                    href={active.url}
                    download
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10"
                  >
                    <Download className="h-3.5 w-3.5" /> Download HD Image
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const add = useAdminStore((s) => s.addUpload)
  const [type, setType] = useState<AdminUpload['type']>('image')
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => setUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!label.trim() || !url.trim()) return
    add({
      type,
      label: label.trim(),
      url: url.trim(),
      customerName: customerName.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
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
          <h3 className="font-display text-xl font-bold">New upload</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
              <select className={cls} value={type} onChange={(e) => setType(e.target.value as AdminUpload['type'])}>
                <option value="logo">logo</option>
                <option value="image">image</option>
                <option value="text">text</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Label *</label>
              <input className={cls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="College Crest" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer name</label>
              <input className={cls} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer email</label>
              <input type="email" className={cls} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">File / URL *</label>
            <div className="mt-1.5 flex items-center gap-3">
              {url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-white/15">
                <UploadIcon className="h-3.5 w-3.5" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </label>
              <input className={`${cls} mt-0 flex-1`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            Save upload
          </button>
        </div>
      </motion.div>
    </div>
  )
}
