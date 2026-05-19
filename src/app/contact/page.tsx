import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ContactForm } from '@/components/ContactForm'
import { COMPANY } from '@/data/brand'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Contact Us',
  description: `Contact ${COMPANY.shortName} for custom t-shirt printing quotes. ${COMPANY.phone}`,
  path: '/contact',
})

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Let's print something great together"
        subtitle="Quotes for custom tees, bulk orders, and corporate programs — we reply within 24 hours."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact' },
        ]}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                align="left"
                eyebrow="Send a message"
                title="Request a quote"
                subtitle="Tell us about your project — quantity, design, and delivery city."
              />
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold">Serving across India</h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">
                  We ship custom and bulk t-shirt orders to{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {COMPANY.locations.join(' · ')}
                  </span>{' '}
                  and the rest of India.
                </p>
              </div>

              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold">Contact details</h3>
                <ul className="mt-6 space-y-4 text-sm">
                  <li>
                    <span className="font-semibold text-slate-500">Phone</span>
                    <br />
                    <a href={`tel:${COMPANY.phoneTel}`} className="text-brand hover:underline">
                      {COMPANY.phone}
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold text-slate-500">Email</span>
                    <br />
                    <a href={`mailto:${COMPANY.email}`} className="text-brand hover:underline">
                      {COMPANY.email}
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold text-slate-500">Hours</span>
                    <br />
                    {COMPANY.hours}
                  </li>
                  <li>
                    <span className="font-semibold text-slate-500">Rating</span>
                    <br />
                    {COMPANY.rating}★ · {COMPANY.reviewCount} reviews
                  </li>
                </ul>
              </div>

              <Link
                href={`https://wa.me/${COMPANY.whatsapp}?text=Hi%2C%20I%20need%20a%20custom%20t-shirt%20quote`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-600"
              >
                <span className="text-xl">💬</span>
                Chat on WhatsApp — fastest response
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
