'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="font-display text-3xl font-bold leading-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </motion.div>
  )
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = 'sky',
  index = 0,
}: {
  label: string
  value: string
  delta?: string
  icon: LucideIcon
  tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'fuchsia'
  index?: number
}) {
  const tones: Record<string, string> = {
    sky: 'from-sky-500 to-blue-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
    violet: 'from-violet-500 to-purple-600',
    fuchsia: 'from-fuchsia-500 to-pink-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
          {delta ? (
            <p
              className={`mt-2 text-xs font-bold ${
                delta.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'
              }`}
            >
              {delta}
            </p>
          ) : null}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    printing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    'quality-check': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
    packed: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    pending: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    new: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    quoted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    lost: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    expired: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    draft: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  }
  const cls = map[status.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status.replace(/-/g, ' ')}
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <p className="font-display text-lg font-bold">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}
