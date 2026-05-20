'use client'

import Link from 'next/link'
import { useCart } from '@/store/useCart'

export function CartBadge() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0))

  return (
    <Link
      href="/cart"
      className="glass relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition hover:scale-105"
      aria-label="Cart"
    >
      🛒
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  )
}
