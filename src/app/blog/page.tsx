import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { CTABanner } from '@/components/ui/CTABanner'
import { BlogPageClient } from '@/components/pages/BlogPageClient'
import { BLOG_POSTS } from '@/data/blog'
import { articleJsonLd, pageMeta } from '@/lib/seo'

const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0]

export const metadata: Metadata = pageMeta({
  title: 'Blog',
  description: 'T-shirt printing tips, startup branding guides, corporate uniform insights & industry trends.',
  path: '/blog',
})

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(featured)),
        }}
      />

      <PageHero
        eyebrow="Insights"
        title="T-shirt printing guides & brand tips"
        subtitle="Expert articles on custom printing, bulk orders, corporate wear, and streetwear trends in India."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
      />

      <BlogPageClient posts={BLOG_POSTS} featured={featured} />

      <div className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <CTABanner
          title="Ready to print?"
          subtitle="Turn what you learned into your next merch drop or corporate order."
          primary={{ label: 'Shop Tees', href: '/shop' }}
          secondary={{ label: 'Bulk Quote', href: '/bulk-orders' }}
        />
      </div>
    </>
  )
}
