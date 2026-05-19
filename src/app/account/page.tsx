import type { Metadata } from 'next'
import { AccountView } from '@/components/account/AccountView'
import { PageHero } from '@/components/ui/PageHero'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'My Account',
  description: 'Orders, wishlist, saved designs, addresses, and profile settings.',
  path: '/account',
})

export default function AccountPage() {
  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title="My Account"
        subtitle="Track orders, manage wishlist, saved designs, and delivery addresses."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
        ]}
        variant="dark"
      />
      <AccountView />
    </>
  )
}
