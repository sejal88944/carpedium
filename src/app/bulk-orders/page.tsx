import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTABanner } from '@/components/ui/CTABanner'
import { TrustBadges } from '@/components/ui/TrustBadges'
import { BulkOrderForm } from '@/components/forms/BulkOrderForm'
import {
  BULK_PRICING,
  FABRICS,
  PRINT_METHODS,
  TESTIMONIALS,
} from '@/data/site'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Bulk T-Shirt Printing',
  description: 'Bulk t shirt printing India — events, teams, colleges. Best rates & fast turnaround.',
  path: '/bulk-orders',
})

export default function BulkOrdersPage() {
  return (
    <>
      <PageHero
        variant="dark"
        eyebrow="Volume Orders"
        title="Bulk t-shirt printing with tiered savings"
        subtitle="Minimum 25 pieces · Free design support · DTG, screen, vinyl & embroidery · Pan-India delivery in 7–14 days."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Bulk Orders' },
        ]}
        cta={[
          { label: 'Get Quote Below', href: '#quote-form' },
          { label: 'WhatsApp Us', href: 'https://wa.me/919529998320' },
        ]}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Pricing tiers"
            title="Transparent bulk pricing"
            subtitle="Per-piece rates improve as quantity grows. Final quote depends on fabric, print method, and colours."
          />
          <div className="mt-12 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-brand/10">
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">From</th>
                  <th className="px-6 py-4 font-semibold">Savings</th>
                </tr>
              </thead>
              <tbody>
                {BULK_PRICING.map((row, i) => (
                  <tr
                    key={row.qty}
                    className={i % 2 === 0 ? 'bg-white dark:bg-void-3' : 'bg-slate-50/80 dark:bg-void-2/50'}
                  >
                    <td className="px-6 py-4 font-medium">{row.qty}</td>
                    <td className="px-6 py-4 text-brand font-bold">{row.price}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{row.discount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-slate-50/80 py-20 dark:border-white/5 dark:bg-void-2/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <SectionHeader
                align="left"
                eyebrow="Print methods"
                title="Right technique for every run"
              />
              <ul className="mt-8 space-y-4">
                {PRINT_METHODS.map((m) => (
                  <li key={m.name} className="glass rounded-xl p-5">
                    <p className="font-display font-bold">{m.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{m.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeader align="left" eyebrow="Fabrics" title="Premium blanks for bulk" />
              <ul className="mt-8 space-y-4">
                {FABRICS.map((f) => (
                  <li key={f.name} className="glass rounded-xl p-5">
                    <p className="font-display font-bold">{f.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{f.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="quote-form" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <BulkOrderForm />
            <div>
              <SectionHeader
                align="left"
                eyebrow="Why bulk with us"
                title="Built for events, teams & corporates"
              />
              <ul className="mt-8 space-y-3 text-slate-600 dark:text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-brand">✓</span> Free design assistance & digital proofs
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✓</span> Screen print, DTG, vinyl & embroidery
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✓</span> Pan-India delivery with tracking
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">✓</span> COD for verified bulk clients
                </li>
              </ul>
              <div className="mt-10">
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Testimonials" title="What bulk clients say" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="glass rounded-2xl p-8">
                <p className="text-amber-400">{'★'.repeat(t.rating)}</p>
                <p className="mt-4 text-slate-700 dark:text-zinc-300">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-6">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CTABanner
          title="Planning 500+ pieces?"
          subtitle="Get a dedicated account manager, custom fabric sourcing, and net-15 invoicing."
          primary={{ label: 'Contact Sales', href: '/contact' }}
          secondary={{ label: 'Corporate Programs', href: '/corporate' }}
        />
      </div>
    </>
  )
}
