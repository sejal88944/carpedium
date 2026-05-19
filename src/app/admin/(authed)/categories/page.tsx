'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Upload, Tag } from 'lucide-react'
import { AdminPageHeader, Card, EmptyState } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminCategory } from '@/store/useAdminStore'

export default function CategoriesPage() {
  const categories = useAdminStore((s) => s.categories)
  const products = useAdminStore((s) => s.products)
  const deleteCategory = useAdminStore((s) => s.deleteCategory)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete category "${name}"?`)) deleteCategory(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Organize products by collection — Men, Women, Couple & more."
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </button>
        }
      />

      {hydrated && categories.length === 0 ? (
        <Card>
          <div className="grid place-items-center py-14 text-center">
            <Tag className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No categories yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Create your first collection — e.g. Men T-Shirts, Women T-Shirts, Couple Sets, Kids.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add category
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category === c.name).length
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl"
                      style={{ background: c.surface || '#f4f4f4' }}
                    >
                      {c.image ? (
                        <Image src={c.image} alt={c.name} fill className="object-contain" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-300">
                          <Tag className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg font-bold">{c.name}</p>
                      <p className="text-xs text-slate-500">/{c.slug}</p>
                      <p className="mt-1 text-xs font-bold text-brand">{count} products</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-white/5"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/5"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {creating || editing ? (
        <CategoryForm
          category={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      ) : null}

      {!hydrated ? <EmptyState title="Loading..." /> : null}
    </div>
  )
}

function CategoryForm({
  category,
  onClose,
}: {
  category: AdminCategory | null
  onClose: () => void
}) {
  const addCategory = useAdminStore((s) => s.addCategory)
  const updateCategory = useAdminStore((s) => s.updateCategory)

  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [tagline, setTagline] = useState(category?.tagline ?? '')
  const [image, setImage] = useState(category?.image ?? '')
  const [surface, setSurface] = useState(category?.surface ?? '#f4f4f4')

  function autoSlug(t: string) {
    return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleSave() {
    if (!name.trim()) return
    const payload = {
      name: name.trim(),
      slug: slug.trim() || autoSlug(name),
      tagline: tagline.trim() || undefined,
      image: image.trim() || undefined,
      surface: surface.trim() || undefined,
    }
    if (category) updateCategory(category.id, payload)
    else addCategory(payload)
    onClose()
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const cls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-bold">{category ? 'Edit category' : 'New category'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
            <input
              className={cls}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug || slug === autoSlug(name)) setSlug(autoSlug(e.target.value))
              }}
              placeholder="Women T-Shirts"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Slug</label>
            <input className={cls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="women-t-shirts" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tagline</label>
            <input className={cls} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Soft cotton · feminine cuts" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image</label>
            <div className="mt-2 flex items-center gap-3">
              {image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={image} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-white/15">
                <Upload className="h-3.5 w-3.5" /> Upload
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
              <input className={`${cls} mt-0 flex-1`} value={image} onChange={(e) => setImage(e.target.value)} placeholder="…or image URL" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Card background</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="color"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white dark:border-white/10"
              />
              <input className={`${cls} mt-0 flex-1`} value={surface} onChange={(e) => setSurface(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            {category ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
