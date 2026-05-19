import { ReactNode } from 'react'

export function PageShell({
  title,
  children,
  subtitle,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      {subtitle ? <p className="mt-3 text-slate-600 dark:text-zinc-400">{subtitle}</p> : null}
      <div className="mt-10 space-y-4 text-slate-700 dark:text-zinc-300">{children}</div>
    </div>
  )
}
