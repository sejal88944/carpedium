import { COMPANY } from '@/data/brand'

const FEATURES = [
  { title: 'Premium Fabric', desc: 'Soft cotton, polo pique, oversized GSM options.' },
  { title: 'Fast Delivery', desc: 'Reliable dispatch for Pune, Mumbai, Hyderabad, Bangalore and more.' },
  { title: 'HD Printing', desc: 'Logo-safe, color-rich print quality for brands and events.' },
  { title: 'Bulk Discounts', desc: 'Better pricing for teams, colleges, corporates and resellers.' },
  { title: '24/7 Support', desc: `WhatsApp and call assistance at ${COMPANY.phone}.` },
]

export function WhyChooseUs() {
  return (
    <section className="bg-slate-50 py-20 dark:bg-void-2 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
            Professional printing quality for every order size
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-lg font-bold text-brand">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
