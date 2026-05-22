'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { COMPANY } from '@/data/brand'
import { BrandLogo } from '@/components/layout/BrandLogo'

export function Footer({ compactMobile = false }: { compactMobile?: boolean }) {
  return (
    <footer
      className={`mt-12 w-full max-w-full overflow-x-hidden border-t border-black/5 bg-void-2 text-zinc-400 dark:border-white/10 sm:mt-20 ${
        compactMobile ? 'pb-28 pt-16 sm:pb-24 sm:pt-20' : 'pb-24 pt-20 sm:pt-28 md:pb-16'
      }`}
    >
      <motion.div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:px-8">
        <div>
          <BrandLogo href="/" size="md" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-500/90">
            {COMPANY.tagline}
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
          <div className="mt-5">
            <a
              href={COMPANY.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
              aria-label="Follow Carpe Diem on Instagram"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @customize_tshirts6
            </a>
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
            <li className="break-words">{COMPANY.locations.join(' · ')}</li>
            <li>
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300"
              >
                Instagram — @customize_tshirts6
              </a>
            </li>
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
        © {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
      </p>
    </footer>
  )
}
