import Link from 'next/link'
import { COMPANY } from '@/data/brand'

export function GMBSection() {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3 lg:px-8">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Delivery</p>
          <p className="mt-2 font-display text-xl font-bold">Pan India</p>
          <p className="mt-2 text-sm text-slate-600">{COMPANY.locations.join(' · ')}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Hours</p>
          <p className="mt-2 font-display text-xl font-bold">{COMPANY.hours}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Contact</p>
          <p className="mt-2 font-bold">{COMPANY.phone}</p>
          <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-brand">
            Get Quote →
          </Link>
        </div>
      </div>
    </section>
  )
}
