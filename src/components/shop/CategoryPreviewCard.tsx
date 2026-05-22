'use client'

import Link from 'next/link'
import type { CategoryPreview } from '@/data/categoryPreviews'
import { ProductGalleryImage } from './ProductGalleryImage'

type Props = {
  preview: CategoryPreview
  active?: boolean
  onSelect?: () => void
  count?: number
  /** Sidebar chip vs full spotlight row */
  variant?: 'sidebar' | 'spotlight'
  className?: string
}

export function CategoryPreviewCard({
  preview,
  active,
  onSelect,
  count,
  variant = 'sidebar',
  className = '',
}: Props) {
  const inner = (
    <>
      <ProductGalleryImage
        images={preview.images}
        labels={preview.labels}
        alt={preview.title}
        surface={preview.surface}
        compact={variant === 'sidebar'}
      />
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 ${
          active ? 'bg-brand text-white' : 'bg-black/[0.03] dark:bg-white/[0.06]'
        }`}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{variant === 'sidebar' ? 'Mens' : preview.title}</p>
          {variant === 'spotlight' ? (
            <p className="text-[11px] opacity-80">Front + Back · एकाच card मध्ये</p>
          ) : null}
        </div>
        {count !== undefined ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active ? 'bg-white/25' : 'bg-black/10 dark:bg-white/15'
            }`}
          >
            {count}
          </span>
        ) : null}
      </div>
    </>
  )

  const shell = `block w-full overflow-hidden rounded-2xl border-2 text-left transition ${
    active
      ? 'border-brand shadow-md ring-2 ring-brand/20'
      : 'border-black/10 hover:border-brand/40 dark:border-white/10'
  }`

  if (variant === 'spotlight') {
    return (
      <Link
        href={`/shop/${preview.slug}`}
        className={`${shell} group glass glass-hover ${className}`}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onSelect} className={`${shell} ${className}`}>
      {inner}
    </button>
  )
}
