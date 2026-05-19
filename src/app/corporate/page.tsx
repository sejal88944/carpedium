import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTABanner } from '@/components/ui/CTABanner'
import { COMPANY } from '@/data/brand'
import { CLIENT_LOGOS } from '@/data/site'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Corporate T-Shirt Printing',
  description: 'Corporate t shirt printing, company uniform t shirts, printed polo t shirts India.',
  path: '/corporate',
})

const SERVICES = [
  {
    title: 'Startup Branding',
    desc: 'Launch kits, investor meetups, and team merch that builds culture from day one.',
    href: '/shop?cat=startup',
  },
  {
    title: 'Employee Uniforms',
    desc: 'Polos, tees & hoodies with embroidery or screen print — sizing curves for full teams.',
    href: '/shop?cat=corporate',
  },
  {
    title: 'Event Branding',
    desc: 'Marathons, college fests, conferences — 500+ piece runs with on-time delivery.',
    href: '/bulk-orders',
  },
  {
    title: 'Promotional Merch',
    desc: 'Giveaways, welcome kits, and campaign tees with your logo in brand-accurate colours.',
    href: '/design',
  },
] as const

const CASE_STUDIES = [
  {
    client: 'TechStart Pune',
    project: '200 launch tees · DTG + 220 GSM',
    result: 'Delivered 48h before product demo',
  },
  {
    client: 'Mumbai Marathon',
    project: '1,200 volunteer tees · screen print',
    result: 'Size curve delivered across 6 zones',
  },
  {
    client: 'Hyderabad FC',
    project: 'Fan merch drop · oversized 240 GSM',
    result: 'Sold out first weekend pop-up',
  },
] as const

const PORTFOLIO = [
  'Embroidered polo uniforms',
  'Startup launch crew necks',
  'College fest back prints',
  'Corporate welcome kits',
  'Sports jersey vinyl names',
  'Promo tee gift packs',
] as const

export default function CorporatePage() {
  return (
    <>
      <PageHero
        variant="dark"
        eyebrow="Corporate Solutions"
        title="Uniforms, polos & branded apparel for teams that mean business"
        subtitle={`${COMPANY.shortName} partners with HR, marketing, and founders across ${COMPANY.locations.join(', ')} for company uniform t shirts, printed polo t shirts, and promotional merchandise.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Corporate' },
        ]}
        cta={[
          { label: 'Get Corporate Quote', href: '/contact' },
          { label: 'Bulk Pricing', href: '/bulk-orders' },
        ]}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="What we deliver"
            title="End-to-end corporate apparel programs"
            subtitle="From artwork proof to pan-India dispatch — one partner for every branded tee need."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="glass glass-hover group rounded-2xl p-8"
              >
                <h3 className="font-display text-xl font-bold group-hover:text-brand">{s.title}</h3>
                <p className="mt-3 text-slate-600 dark:text-zinc-400">{s.desc}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-slate-50/80 py-20 dark:border-white/5 dark:bg-void-2/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Trusted by"
            title="Brands & events we've printed for"
          />
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {CLIENT_LOGOS.map((logo) => (
              <div
                key={logo}
                className="glass rounded-full px-6 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-300"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Case studies" title="Real projects, real results" />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {CASE_STUDIES.map((cs) => (
              <div key={cs.client} className="glass rounded-2xl p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                  {cs.client}
                </p>
                <h3 className="mt-3 font-display text-lg font-bold">{cs.project}</h3>
                <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">✓ {cs.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50/80 py-20 dark:bg-void-2/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Portfolio"
            title="Sample corporate print work"
            subtitle="Placeholder gallery — replace with your production photos."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO.map((item) => (
              <div
                key={item}
                className="flex aspect-square items-end rounded-2xl bg-gradient-to-br from-slate-800 to-void-2 p-6"
              >
                <span className="font-semibold text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CTABanner
          title="Let's brand your team"
          subtitle="GST invoicing, PO acceptance, and dedicated account support for corporate clients."
          primary={{ label: 'Request Corporate Quote', href: '/contact' }}
          secondary={{ label: 'View Bulk Pricing', href: '/bulk-orders' }}
        />
      </div>
    </>
  )
}
