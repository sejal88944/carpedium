import type { Metadata } from 'next'
import { CartView } from '@/components/cart/CartView'
import { PageHero } from '@/components/ui/PageHero'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Shopping Cart',
  description: 'Review your custom tees, apply coupons, and order instantly on WhatsApp.',
  path: '/cart',
})

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Your bag"
        title="Shopping Cart"
        subtitle="Premium custom tees — adjust quantities, apply WELCOME10 for 10% off, and order on WhatsApp."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          { label: 'Cart' },
        ]}
      />
      <CartView />
    </>
  )
}
