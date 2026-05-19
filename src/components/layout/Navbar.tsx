'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPANY } from '@/data/brand'
import { useTheme } from '@/components/ThemeProvider'
import { CartBadge } from '@/components/layout/CartBadge'

/**
 * Primary navbar links — kept lean for SEO crawl priority + Google My Business mapping.
 * Top-intent pages (Shop, Customize, Bulk Orders) are surfaced first; About preserves
 * E-A-T signals. Contact lives in the footer (with WhatsApp + email) to reduce nav clutter.
 */
const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/design', label: 'Customize' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-black/5 bg-white/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-void/85'
          : 'border-b border-transparent bg-white/55 backdrop-blur-md dark:bg-void/45'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-gradient">
            {COMPANY.shortName}
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500 sm:block">
            Custom T-Shirt Printing
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-black/5 bg-white/55 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:scale-[1.03] hover:text-brand dark:text-zinc-300 dark:hover:text-sky-300"
            >
              {l.label}
              <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <motion.div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="glass rounded-full px-3 py-1.5 text-xs font-medium"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <CartBadge />
          <Link
            href="/design"
            className="hidden rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:scale-105 hover:shadow-xl sm:inline-flex"
          >
            Customize Now
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            ☰
          </button>
        </motion.div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/5 bg-white/95 shadow-xl backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-void/95"
          >
            <nav className="flex flex-col gap-2 p-4">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/design"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-4 py-3 text-center text-sm font-bold text-white shadow-glow"
              >
                Customize Now
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
