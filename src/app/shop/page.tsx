import type { Metadata } from 'next'
import { ProductListing } from '@/components/shop/ProductListing'
import { PageHero } from '@/components/ui/PageHero'
import { TrustBadges } from '@/components/ui/TrustBadges'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Shop Custom T-Shirts',
  description:
    'Men, Women & Couple custom T-shirts — premium logo & graphic printing with filters, wishlist & quick view.',
  path: '/shop',
})

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Premium Catalog"
        title="Shop Custom T-Shirts"
        subtitle="Filter by category, color, size and price. Customize any tee in our live design studio or order bulk for your team."
        breadcrumbs={[{ label: 'Shop' }]}
        cta={[
          { label: 'Start Designing', href: '/design' },
          { label: 'Bulk Orders', href: '/bulk-orders' },
        ]}
      />
      <section className="mx-auto max-w-7xl px-4 pb-24 lg:px-8">
        <ProductListing />
      </section>
      <section className="border-t border-black/5 py-12 dark:border-white/10">
        <TrustBadges />
      </section>
    </>
  )
}
