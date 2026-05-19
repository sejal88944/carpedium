import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { COMPANY } from '@/data/brand'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({ title: 'Terms & Conditions', path: '/terms' })

export default function TermsPage() {
  return (
    <PageShell title="Terms & Conditions">
      <p>Orders are subject to design approval. {COMPANY.name} — all sales per quoted terms.</p>
    </PageShell>
  )
}
