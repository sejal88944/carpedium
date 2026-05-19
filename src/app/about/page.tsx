import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CTABanner } from '@/components/ui/CTABanner'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { COMPANY } from '@/data/brand'
import { PROCESS_STEPS, STATS } from '@/data/site'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'About Us',
  description: `${COMPANY.name} — premium custom T-shirt printing for businesses and brands across India.`,
  path: '/about',
})

const CAPABILITIES = [
  {
    title: 'DTG Digital Printing',
    desc: 'Photo-quality full-colour prints for one-off custom tees, startup merch and detailed artwork.',
  },
  {
    title: 'Screen Printing',
    desc: 'Vibrant solid-colour bulk runs — best cost per piece for events, college fests and team uniforms.',
  },
  {
    title: 'Vinyl & Heat Transfer',
    desc: 'Crisp names, numbers and jersey print for sports squads, marathons and short runs.',
  },
  {
    title: 'Machine Embroidery',
    desc: 'Premium thread-stitched logos on polos and uniforms — the corporate-grade finish brands love.',
  },
  {
    title: 'Design & Mockup Support',
    desc: 'Free logo prep, colour matching and HD mockup before we hit the press — no surprises on delivery day.',
  },
  {
    title: 'Bulk Fulfillment',
    desc: 'Strict QC, batch-wise packing and pan-India dispatch with order tracking on WhatsApp.',
  },
] as const

const WHY_US = [
  {
    title: 'Single piece to 10,000+',
    desc: 'No minimum order. One tee for a gift or 10K for a corporate launch — same care, same press.',
  },
  {
    title: 'Premium fabrics only',
    desc: '180/220/240 GSM combed cotton, oversized blends, pique polo — stocked and ready.',
  },
  {
    title: 'Transparent bulk pricing',
    desc: 'Published per-piece slabs from 25 → 500+ units. No hidden setup fees, no surprise add-ons.',
  },
  {
    title: 'WhatsApp-first service',
    desc: 'Quote, proof, payment, delivery updates — all on the chat your customers already use daily.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Crafting premium custom tees for India&apos;s boldest brands"
        subtitle={`${COMPANY.shortName} started with one belief: every startup, team, and event deserves apparel that feels as good as it looks. Today we print thousands of tees monthly across ${COMPANY.locations.join(', ')}.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About' },
        ]}
        cta={[
          { label: 'Start Designing', href: '/design' },
          { label: 'Bulk Orders', href: '/bulk-orders' },
        ]}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionHeader
              align="left"
              eyebrow="Who we are"
              title="From garage prints to a full-scale print house"
              subtitle={`${COMPANY.name} combines HD print technology, premium fabrics, and human design support so your brand shows up consistently — whether it is 1 tee or 10,000.`}
            />
            <div className="glass rounded-[2rem] p-8 md:p-10">
              <h3 className="font-display text-xl font-bold text-brand">Our Vision</h3>
              <p className="mt-3 text-slate-600 dark:text-zinc-400">
                To be India&apos;s most trusted partner for custom apparel — where quality, speed, and
                design support are never negotiable.
              </p>
              <h3 className="mt-8 font-display text-xl font-bold text-brand">Our Mission</h3>
              <p className="mt-3 text-slate-600 dark:text-zinc-400">
                Deliver premium printed tees with transparent pricing, free proofs, and delivery
                that teams can count on for launches, fests, and corporate rollouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-slate-50/80 py-20 dark:border-white/5 dark:bg-void-2/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="By the numbers"
            title="Trusted by startups, HR teams & event organisers"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <AnimatedCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="How it works"
            title="Your design journey in four simple steps"
            subtitle="From catalog pick to doorstep delivery — we keep you in the loop at every stage."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="glass glass-hover relative rounded-2xl p-6 pt-10">
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-1 text-xs font-bold text-white">
                  {step.step}
                </span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="What we do"
            title="End-to-end custom apparel production"
            subtitle="Every print method, every quantity, every finish — under one roof."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="glass glass-hover rounded-2xl p-6 transition hover:-translate-y-1"
              >
                <h3 className="font-display text-lg font-bold text-brand">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50/80 py-20 dark:bg-void-2/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Why brands pick us"
            title="What makes a difference on every order"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w, i) => (
              <div
                key={w.title}
                className="glass relative rounded-2xl p-6 pt-12 transition hover:-translate-y-1"
              >
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-3 py-1 text-xs font-bold text-white">
                  0{i + 1}
                </span>
                <h3 className="font-display text-base font-bold">{w.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader
            eyebrow="Where we serve"
            title="Pan-India custom T-shirt printing"
            subtitle="Headquartered in Pune — shipping across India with regional support hubs."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {COMPANY.locations.map((city) => (
              <div
                key={city}
                className="glass flex items-center justify-center rounded-2xl px-4 py-6 text-center font-display text-base font-bold transition hover:-translate-y-0.5 hover:text-brand"
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CTABanner
          title="Ready to print your story?"
          subtitle="Get a free mockup and quote — single tees or bulk runs across India."
          primary={{ label: 'Custom Design Studio', href: '/design' }}
          secondary={{ label: 'Bulk Inquiry', href: '/bulk-orders' }}
        />
      </div>
    </>
  )
}
