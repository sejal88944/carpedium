import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { CTABanner } from '@/components/ui/CTABanner'
import { BLOG_POSTS } from '@/data/blog'
import { articleJsonLd, pageMeta } from '@/lib/seo'
import { COMPANY } from '@/data/brand'
import { AdminBlogFallback } from '@/components/pages/AdminBlogFallback'

type Params = { slug: string }

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = true

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return pageMeta({ title: 'Article', path: `/blog/${slug}` })
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return <AdminBlogFallback slug={slug} />

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }}
      />

      <PageHero
        eyebrow={post.category}
        title={post.title}
        subtitle={`${post.readTime} read · ${new Date(post.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{post.excerpt}</p>

          <h2>Why this matters for your brand</h2>
          <p>
            At <strong>{COMPANY.shortName}</strong> we work with startups, colleges, corporate teams and event organisers
            across {COMPANY.locations.slice(0, 4).join(', ')} and beyond. Choosing the right printing partner shapes how
            your brand looks on day one — fabric, finish, and finishing matter.
          </p>

          <h2>Key takeaways</h2>
          <ul>
            {post.tags.map((t) => (
              <li key={t}>
                <strong>{t}</strong> — covered in detail in this article.
              </li>
            ))}
            <li>Lead times, MOQ, and pricing best practices for {post.category.toLowerCase()} projects.</li>
            <li>Real examples from our recent {COMPANY.shortName} customer drops.</li>
          </ul>

          <h2>Get started</h2>
          <p>
            Want a custom quote? Drop a message on{' '}
            <Link href="/bulk-orders">Bulk Orders</Link> or WhatsApp us at{' '}
            <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer">
              {COMPANY.phone}
            </a>
            . We respond within an hour during working time ({COMPANY.hours}).
          </p>

          <p className="not-prose mt-8 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand"
              >
                #{t}
              </span>
            ))}
          </p>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="bg-slate-50 py-12 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold">Related articles</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{r.category}</p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-tight group-hover:text-brand">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{r.excerpt}</p>
                  <p className="mt-3 text-xs text-slate-400">{r.readTime} read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
