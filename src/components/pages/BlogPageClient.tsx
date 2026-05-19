'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/data/blog'
import { BLOG_CATEGORIES } from '@/data/blog'
import { useAdminStore } from '@/store/useAdminStore'

function readTimeFor(text?: string) {
  if (!text) return '4 min'
  const words = text.trim().split(/\s+/).length
  return `${Math.max(2, Math.round(words / 200))} min`
}

export function BlogPageClient({ posts, featured }: { posts: BlogPost[]; featured: BlogPost }) {
  const adminBlogs = useAdminStore((s) => s.blogs)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const allPosts = useMemo<BlogPost[]>(() => {
    if (!hydrated || adminBlogs.length === 0) return posts
    const adminMapped: BlogPost[] = adminBlogs
      .filter((b) => b.published)
      .map((b) => ({
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || b.metaDescription || '',
        category: b.category || 'General',
        tags: [],
        readTime: readTimeFor(b.body),
        date: b.publishedAt || b.createdAt.slice(0, 10),
      }))
    const seenSlugs = new Set(adminMapped.map((p) => p.slug))
    const seedRest = posts.filter((p) => !seenSlugs.has(p.slug))
    return [...adminMapped, ...seedRest]
  }, [hydrated, adminBlogs, posts])

  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const rest = allPosts.filter((p) => p.slug !== featured.slug)
    return rest.filter((p) => {
      const matchCat = category === 'All' || p.category === category
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
  }, [allPosts, featured.slug, category, search])

  return (
    <>
      <section className="border-b border-black/5 py-20 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-void via-void-2 to-slate-900 p-8 text-white md:p-14"
            >
              <motion.div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-brand/25 blur-3xl" />
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-gold">
                Featured Article
              </p>
              <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                {featured.category}
              </span>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight transition group-hover:text-sky-200 md:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-xl text-lg text-zinc-300">{featured.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span>{featured.readTime} read</span>
                <span>·</span>
                <time dateTime={featured.date}>
                  {new Date(featured.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
                <span className="font-semibold text-white">Read article →</span>
              </div>
            </motion.article>
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              placeholder="Search articles, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-void-3 md:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === cat
                      ? 'bg-brand text-white shadow-glow'
                      : 'glass hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <p className="col-span-full py-12 text-center text-slate-500">
                No articles match your search. Try another keyword or category.
              </p>
            ) : (
              filtered.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="glass glass-hover group flex h-full flex-col rounded-2xl p-6"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {post.category}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold group-hover:text-brand">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{post.readTime}</span>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}
