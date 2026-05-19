import Link from 'next/link'
import { TEE_COLORS } from '@/data/brand'

export function InstagramReels() {
  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
              Instagram Reels
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Behind the print process</h2>
          </div>
          <Link href="/contact" className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold">
            Book a Sample
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEE_COLORS.slice(0, 4).map((c) => (
            <div key={c.id} className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-white/5 p-5">
              <div className="absolute inset-x-5 top-5 h-1 rounded-full bg-white/20" />
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <p className="mt-6 font-display text-xl font-bold">{c.name}</p>
                <p className="mt-2 text-sm text-slate-400">Behind-the-scenes printing reel</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
