'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Upload, FileText } from 'lucide-react'
import { AdminPageHeader, Card, StatusBadge } from '@/components/admin/AdminUI'
import { useAdminStore, type AdminBlog } from '@/store/useAdminStore'

export default function BlogsPage() {
  const blogs = useAdminStore((s) => s.blogs)
  const deleteBlog = useAdminStore((s) => s.deleteBlog)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const [editing, setEditing] = useState<AdminBlog | null>(null)
  const [creating, setCreating] = useState(false)

  function handleDelete(id: string, title: string) {
    if (confirm(`Delete "${title}"?`)) deleteBlog(id)
  }

  return (
    <div>
      <AdminPageHeader
        title="Blogs"
        subtitle="Publish SEO-optimised articles with rich content & cover images."
        action={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Blog
          </button>
        }
      />

      {hydrated && blogs.length === 0 ? (
        <Card>
          <div className="grid place-items-center py-14 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <p className="mt-4 font-display text-lg font-bold">No blog posts yet</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Write your first SEO blog — drives organic traffic for keywords like “custom t-shirt printing Pune”.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Write first blog
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div
                className="aspect-[16/10] bg-cover bg-center"
                style={{
                  backgroundImage: b.cover ? `url(${b.cover})` : undefined,
                  backgroundColor: b.cover ? undefined : '#f1f5f9',
                }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{b.category || 'Article'}</p>
                  <StatusBadge status={b.published ? 'published' : 'draft'} />
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-tight">{b.title}</h3>
                {b.excerpt ? <p className="mt-2 line-clamp-2 text-xs text-slate-500">{b.excerpt}</p> : null}
                <p className="mt-3 text-[11px] text-slate-500">
                  {b.author || 'Admin'} · {b.publishedAt || 'Draft'}
                </p>
                <div className="mt-4 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(b)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-white/5"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.title)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/5"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {creating || editing ? (
        <BlogForm
          blog={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      ) : null}
    </div>
  )
}

function BlogForm({ blog, onClose }: { blog: AdminBlog | null; onClose: () => void }) {
  const addBlog = useAdminStore((s) => s.addBlog)
  const updateBlog = useAdminStore((s) => s.updateBlog)

  const [title, setTitle] = useState(blog?.title ?? '')
  const [slug, setSlug] = useState(blog?.slug ?? '')
  const [category, setCategory] = useState(blog?.category ?? '')
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? '')
  const [body, setBody] = useState(blog?.body ?? '')
  const [cover, setCover] = useState(blog?.cover ?? '')
  const [author, setAuthor] = useState(blog?.author ?? 'Admin')
  const [metaTitle, setMetaTitle] = useState(blog?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(blog?.metaDescription ?? '')
  const [published, setPublished] = useState(blog?.published ?? false)

  function autoSlug(t: string) {
    return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleSave() {
    if (!title.trim()) return
    const payload: Omit<AdminBlog, 'id' | 'createdAt'> = {
      title: title.trim(),
      slug: slug.trim() || autoSlug(title),
      category: category.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      body: body.trim() || undefined,
      cover: cover.trim() || undefined,
      author: author.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      published,
      publishedAt: published ? new Date().toISOString().slice(0, 10) : undefined,
    }
    if (blog) updateBlog(blog.id, payload)
    else addBlog(payload)
    onClose()
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => setCover(String(reader.result))
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
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-bold">{blog ? `Edit · ${blog.title}` : 'New blog post'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title *</label>
            <input
              className={cls}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slug || slug === autoSlug(title)) setSlug(autoSlug(e.target.value))
              }}
              placeholder="How custom t-shirts grow your brand..."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Slug</label>
              <input className={cls} value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <input className={cls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Marketing" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Author</label>
              <input className={cls} value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Excerpt</label>
            <textarea className={`${cls} min-h-[80px]`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Body</label>
            <textarea
              className={`${cls} min-h-[180px]`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your blog content here... (markdown supported)"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cover image</label>
            <div className="mt-2 flex items-center gap-3">
              {cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={cover} alt="" className="h-16 w-24 rounded-lg object-cover" />
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
              <input className={`${cls} mt-0 flex-1`} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="…or image URL" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <p className="font-bold">SEO meta</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta title</label>
                <input className={cls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta description</label>
                <input className={cls} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white">
              {blog ? 'Save changes' : published ? 'Publish blog' : 'Save draft'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
