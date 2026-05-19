'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { COMPANY } from '@/data/brand'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-void-2 pb-24 pt-28 text-zinc-400 dark:border-white/10 md:pb-16">
      <motion.div className="mx-auto grid max-w-7xl gap-12 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold text-white">{COMPANY.shortName}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            Custom T-Shirt Printing
          </p>
          <p className="mt-4 text-sm leading-6">{COMPANY.description}</p>
          <p className="mt-4 text-sm">
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-brand">
              {COMPANY.phone}
            </a>
            <br />
            <a href={`mailto:${COMPANY.email}`} className="hover:text-brand">
              {COMPANY.email}
            </a>
          </p>
          <div className="mt-5 flex gap-3 text-lg">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-white">f</a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-white">◎</a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-brand hover:text-white">in</a>
          </div>
        </div>
        <motion.div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li><Link href="/shop" className="hover:text-brand">All Products</Link></li>
            <li><Link href="/design" className="hover:text-brand">Custom Design</Link></li>
            <li><Link href="/bulk-orders" className="hover:text-brand">Bulk Orders</Link></li>
            <li><Link href="/cart" className="hover:text-brand">Cart</Link></li>
            <li><Link href="/account" className="hover:text-brand">My Account</Link></li>
            <li><Link href="/faq" className="hover:text-brand">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact</Link></li>
          </ul>
        </motion.div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white">Categories</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop?category=men-t-shirts" className="hover:text-brand">Men T-Shirts</Link></li>
            <li><Link href="/shop?category=women-t-shirts" className="hover:text-brand">Women T-Shirts</Link></li>
            <li><Link href="/shop?category=couple-t-shirts" className="hover:text-brand">Couple T-Shirts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white">Contact Info</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{COMPANY.phone}</li>
            <li>{COMPANY.email}</li>
            <li>{COMPANY.hours}</li>
            <li>{COMPANY.locations.join(' · ')}</li>
          </ul>
          <div className="mt-5 rounded-2xl bg-white/10 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white">Newsletter</p>
            <div className="mt-3 flex gap-2">
              <input
                placeholder="Email"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              />
              <button className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white">
                Join
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="mx-auto mt-12 max-w-7xl px-4 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm">
          Google Map: Pune · Mumbai · Hyderabad · Bangalore · Nagpur · Nashik delivery network
        </div>
      </div>
      <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </p>
    </footer>
  )
}
