'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react'
import { ADMIN_NAV } from './AdminNav'
import { signOut } from 'next-auth/react'
import { useAdminStore } from '@/store/useAdminStore'
import { useSeedAdminStore } from '@/store/adminSeed'

function useLiveBadges() {
  const orders = useAdminStore((s) => s.orders)
  const uploads = useAdminStore((s) => s.uploads)
  const bulkOrders = useAdminStore((s) => s.bulkOrders)
  const messages = useAdminStore((s) => s.messages)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  if (!hydrated) return {} as Record<string, number>
  return {
    '/admin/orders': orders.filter((o) =>
      ['confirmed', 'printing', 'quality-check', 'packed'].includes(o.status),
    ).length,
    '/admin/uploads': uploads.filter((u) => u.status === 'pending').length,
    '/admin/bulk-orders': bulkOrders.filter((b) => b.status === 'new').length,
    '/admin/messages': messages.length,
  }
}

export function AdminShell({
  children,
  adminName,
  adminEmail,
}: {
  children: React.ReactNode
  adminName: string
  adminEmail: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const badges = useLiveBadges()
  useSeedAdminStore()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden dark:border-white/10 dark:bg-slate-950/80">
        <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-bold">
          <ShieldCheck className="h-5 w-5 text-brand" /> AASHA Admin
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white/60 px-4 py-6 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-slate-900/40">
          <Link href="/admin" className="flex items-center gap-2 px-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-sky-600 text-white shadow-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-none">AASHA Admin</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">Control panel</p>
            </div>
          </Link>

          <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              const badge = badges[item.href]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-gradient-to-r from-brand to-sky-600 text-white shadow-lg shadow-brand/20'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        active ? 'bg-white/25 text-white' : 'bg-brand/10 text-brand'
                      }`}
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-sm font-bold text-white">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{adminName}</p>
                <p className="truncate text-[11px] text-slate-500">{adminEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full w-72 overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">AASHA Admin</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-6 space-y-1">
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                  const badge = badges[item.href]
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        active
                          ? 'bg-gradient-to-r from-brand to-sky-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:text-rose-300"
                >
                  <LogOut className="h-[18px] w-[18px]" /> Logout
                </button>
              </nav>
            </motion.aside>
          </div>
        ) : null}

        {/* Main */}
        <main className="min-h-screen flex-1">
          <header className="hidden items-center justify-end gap-3 border-b border-slate-200 bg-white/60 px-8 py-4 backdrop-blur lg:flex dark:border-white/10 dark:bg-slate-900/40">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
            >
              View site →
            </Link>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
