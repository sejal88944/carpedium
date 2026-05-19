import { COMPANY } from '@/data/brand'

export function LocalSeoSection() {
  return (
    <section className="border-t border-black/5 bg-brand/5 py-16 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 text-center lg:px-8">
        <h2 className="font-display text-2xl font-bold">Pan-India Custom T-Shirt Printing</h2>
        <p className="mt-4 text-slate-600 dark:text-zinc-400">
          We provide premium custom T-shirt printing services across{' '}
          <strong>{COMPANY.locations.join(', ')}</strong>. Polo tshirt manufacturer, corporate
          tshirt supplier, startup tshirt printing & bulk tshirt supplier — all under one roof.
        </p>
        <p className="mt-4 text-slate-600 dark:text-zinc-400">
          If you are searching for custom tshirt printing Pune, polo tshirt printing, corporate
          tshirts, bulk tshirt supplier, custom uniform printing or promotional t shirts, AASHA-SM
          TECH offers a complete branding workflow: choose apparel, select color, upload logo,
          preview front/back, approve artwork and receive delivery across major Indian cities.
        </p>
      </div>
    </section>
  )
}
