import Link from 'next/link'

const SERVICES = [
  {
    title: 'Startup branding',
    desc: 'Founder tees, hoodie kits & launch merch for early-stage teams.',
  },
  {
    title: 'Employee uniforms',
    desc: 'Polo, round-neck & oxford uniforms with embroidered logos.',
  },
  {
    title: 'Company T-shirts',
    desc: 'Office tees with brand colours, role tags and bulk discounts.',
  },
  {
    title: 'Event branding',
    desc: 'Conference, hackathon & marathon tees delivered on schedule.',
  },
  {
    title: 'Promotional wear',
    desc: 'Giveaway tees for campaigns, college fests & trade shows.',
  },
  {
    title: 'Printed polo T-shirts',
    desc: 'Premium pique polos with chest, back or sleeve printing.',
  },
]

export function CorporateServices() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Corporate Services
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Branding apparel for startups, teams and enterprises
          </h2>
          <p className="mt-4 text-slate-600 dark:text-zinc-400">
            Build a premium brand presence with company uniforms, employee welcome kits, event
            T-shirts, promotional T-shirts and bulk corporate apparel.
          </p>
          <Link
            href="/corporate"
            className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Explore Corporate Orders
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.title} className="glass glass-hover rounded-2xl p-6">
              <p className="font-display text-lg font-bold">{s.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
