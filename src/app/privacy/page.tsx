import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { COMPANY } from '@/data/brand'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ title: 'Privacy Policy', path: '/privacy' })

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p>{COMPANY.name} respects your privacy. Contact data is used only for order fulfillment and support.</p>
    </PageShell>
  )
}
