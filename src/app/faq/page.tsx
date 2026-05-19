import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTABanner } from '@/components/ui/CTABanner'
import { FaqPageAccordion } from '@/components/pages/FaqPageAccordion'
import { FAQ_CATEGORIES, ALL_FAQ_ITEMS } from '@/data/faq'
import { faqJsonLd, pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'FAQ',
  description: 'Frequently asked questions about custom t-shirt printing, bulk orders, delivery & refunds.',
  path: '/faq',
})

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(ALL_FAQ_ITEMS)),
        }}
      />

      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        subtitle="Everything about orders, printing methods, delivery, bulk pricing, refunds, and customization."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'FAQ' },
        ]}
        cta={[{ label: 'Contact Support', href: '/contact' }]}
      />

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <SectionHeader
            align="left"
            eyebrow="Browse by topic"
            title="Find answers quickly"
          />
          <div className="mt-12">
            <FaqPageAccordion categories={FAQ_CATEGORIES} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CTABanner
          title="Still have questions?"
          subtitle="Our team replies on WhatsApp and email within hours."
          primary={{ label: 'Contact Us', href: '/contact' }}
          secondary={{ label: 'Start Designing', href: '/design' }}
        />
      </div>
    </>
  )
}
