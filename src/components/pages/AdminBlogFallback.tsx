'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { CTABanner } from '@/components/ui/CTABanner'
import { COMPANY } from '@/data/brand'
import { useAdminStore, type AdminBlog } from '@/store/useAdminStore'

export function AdminBlogFallback({ slug }: { slug: string }) {
  const blogs = useAdminStore((s) => s.blogs)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-slate-500">
        Loading article...
      </div>
    )
  }

  const post = blogs.find((b) => b.slug === slug && b.published) as AdminBlog | undefined
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-slate-500">This blog post may have been removed or unpublished.</p>
        <Link
          href="/blog"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
        >
          Back to blog
        </Link>
      </div>
    )
  }

  const dateLabel = (post.publishedAt || post.createdAt.slice(0, 10))
  const dateText = new Date(dateLabel).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <PageHero
        eyebrow={post.category || 'Blog'}
        title={post.title}
        subtitle={`${post.author ? `By ${post.author} · ` : ''}${dateText}`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {post.excerpt ? (
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              {post.excerpt}
            </p>
          ) : null}
          {post.body ? (
            post.body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)
          ) : (
            <p>
              Want to know more? Drop us a message on{' '}
              <Link href="/contact">Contact</Link> or WhatsApp{' '}
              <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
                {COMPANY.phone}
              </a>
              .
            </p>
          )}
        </div>
      </article>

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <CTABanner
          title="Ready to print your design?"
          subtitle="From single piece to 5000+ pcs — premium quality, on-time delivery."
          primary={{ label: 'Customize Now', href: '/design' }}
          secondary={{ label: 'Bulk Quote', href: '/bulk-orders' }}
        />
      </div>
    </>
  )
}
