'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, Pencil, Trash2, X, Upload, Shirt, RotateCcw } from 'lucide-react'
import { AdminPageHeader, Card, EmptyState, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminProduct } from '@/store/useAdminStore'
import { reseedAdminStore } from '@/store/adminSeed'

const CATEGORIES = ['All', 'Men T-Shirts', 'Women T-Shirts', 'Couple T-Shirts'] as const

export default function ProductsPage() {
  const products = useAdminStore((s) => s.products)
  const deleteProduct = useAdminStore((s) => s.deleteProduct)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All')
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [creating, setCreating] = useState(false)

  const items = useMemo(() => {
    return products.filter((p) => {
      if (cat !== 'All' && p.category !== cat) return false
      if (q && !`${p.title} ${p.category}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [products, q, cat])

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) deleteProduct(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Manage your t-shirt catalog — add, edit and track stock. Changes reflect on the storefront."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset products & categories to the default storefront catalog? Custom additions will be removed.')) {
                  reseedAdminStore()
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
              title="Restore the default catalog"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
            </button>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Product
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
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  cat === c
                    ? 'bg-brand text-white'
                    : 'border border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {hydrated && items.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                  <th className="pb-3 pr-3 font-bold">Product</th>
                  <th className="pb-3 pr-3 font-bold">Category</th>
                  <th className="pb-3 pr-3 font-bold">Price</th>
                  <th className="pb-3 pr-3 font-bold">Stock</th>
                  <th className="pb-3 pr-3 font-bold">Sizes</th>
                  <th className="pb-3 pr-3 font-bold">Status</th>
                  <th className="pb-3 pr-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 last:border-0 dark:border-white/5"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg"
                          style={{ background: p.surface || '#f4f4f4' }}
                        >
                          {p.image ? (
                            <Image src={p.image} alt={p.title} fill className="object-contain p-1" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-slate-300">
                              <Shirt className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{p.title}</p>
                          <p className="text-xs text-slate-500">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                    <td className="py-3 pr-3 font-bold">₹{p.price}</td>
                    <td className="py-3 pr-3">{p.stock ?? '—'}</td>
                    <td className="py-3 pr-3 text-xs">{p.sizes.join(', ')}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={p.featured ? 'active' : 'draft'} />
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(p)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-white/5"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/5"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title={hydrated ? 'No products yet' : 'Loading...'}
              description={hydrated ? 'Add your first product to start selling.' : undefined}
            />
          )}
        </div>
      </Card>

      {creating || editing ? (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      ) : null}
    </div>
  )
}

function ProductForm({
  product,
  onClose,
}: {
  product: AdminProduct | null
  onClose: () => void
}) {
  const addProduct = useAdminStore((s) => s.addProduct)
  const updateProduct = useAdminStore((s) => s.updateProduct)

  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [category, setCategory] = useState<AdminProduct['category']>(product?.category ?? 'Men T-Shirts')
  const [price, setPrice] = useState<string>(String(product?.price ?? ''))
  const [compareAt, setCompareAt] = useState<string>(String(product?.compareAt ?? ''))
  const [stock, setStock] = useState<string>(String(product?.stock ?? ''))
  const [sizes, setSizes] = useState(product?.sizes.join(', ') ?? 'S, M, L, XL')
  const [colors, setColors] = useState(product?.colors?.join(', ') ?? '')
  const [tags, setTags] = useState(product?.tags?.join(', ') ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [image, setImage] = useState(product?.image ?? '')
  const [surface, setSurface] = useState(product?.surface ?? '#f4f4f4')
  const [featured, setFeatured] = useState(product?.featured ?? false)

  function autoSlug(t: string) {
    return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price) return
    const payload = {
      title: title.trim(),
      slug: slug.trim() || autoSlug(title),
      description: description.trim(),
      category,
      price: Number(price),
      compareAt: compareAt ? Number(compareAt) : undefined,
      stock: stock ? Number(stock) : undefined,
      sizes: sizes.split(',').map((x) => x.trim()).filter(Boolean),
      colors: colors.split(',').map((x) => x.trim()).filter(Boolean),
      tags: tags.split(',').map((x) => x.trim()).filter(Boolean),
      image: image.trim() || undefined,
      surface: surface.trim() || undefined,
      featured,
    }
    if (product) updateProduct(product.id, payload)
    else addProduct(payload)
    onClose()
  }

  async function handleFile(file: File) {
    // Cloudinary upload uses NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + unsigned preset.
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloud) {
      // Fallback: store as base64 data URL (offline mode).
      const reader = new FileReader()
      reader.onload = () => setImage(String(reader.result))
      reader.readAsDataURL(file)
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'aasha_unsigned')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: 'POST',
      body: fd,
    }).then((r) => r.json())
    if (res.secure_url) setImage(res.secure_url)
  }

  const cls =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-white/10 dark:bg-slate-950'

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-bold">
            {product ? `Edit · ${product.title}` : 'Add new product'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title *</label>
              <input
                required
                className={cls}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slug || slug === autoSlug(title)) setSlug(autoSlug(e.target.value))
                }}
                placeholder="e.g. Oversized Boombox Tee"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Slug</label>
              <input className={cls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="boombox-tee" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                className={cls}
                value={category}
                onChange={(e) => setCategory(e.target.value as AdminProduct['category'])}
              >
                <option>Men T-Shirts</option>
                <option>Women T-Shirts</option>
                <option>Couple T-Shirts</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price (₹) *</label>
              <input
                required
                type="number"
                min={0}
                className={cls}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Compare-at price</label>
              <input
                type="number"
                min={0}
                className={cls}
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock</label>
              <input
                type="number"
                min={0}
                className={cls}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sizes</label>
              <input className={cls} value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tags</label>
              <input className={cls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="oversized, streetwear" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Colors (hex)</label>
              <input
                className={cls}
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="#000000, #ffffff, #0ea5e9"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              className={`${cls} min-h-[100px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Premium combed cotton, double stitched..."
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product image</label>
            <div className="mt-2 flex items-center gap-3">
              {image ? (
                <div
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                  style={{ background: surface }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-full w-full object-contain p-1" />
                </div>
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/[0.02]">
                <Upload className="h-3.5 w-3.5" /> Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFile(f)
                  }}
                />
              </label>
              <input
                className={`${cls} mt-0 flex-1`}
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="…or paste image URL"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Card surface color</label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="color"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white dark:border-white/10"
                />
                <input
                  className={`${cls} mt-0 flex-1`}
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 self-end text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Mark as featured (shows in “Trending”)
            </label>
          </div>
        </form>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} type="button" className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
            {product ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
