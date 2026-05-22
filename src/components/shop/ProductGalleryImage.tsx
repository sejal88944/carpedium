'use client'

import Image from 'next/image'

const DEFAULT_LABELS = ['View 1', 'View 2', 'View 3']

type Props = {
  images: string[]
  alt: string
  labels?: string[]
  surface?: string
  detail?: boolean
  compact?: boolean
  className?: string
}

/** 2 or 3 product mockups in one card (Mens collection). */
export function ProductGalleryImage({
  images,
  alt,
  labels,
  surface = '#f4f4f4',
  detail,
  compact,
  className = '',
}: Props) {
  const shots = images.filter(Boolean).slice(0, 3)
  if (shots.length < 2) return null

  const cols = shots.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
  const pad = compact ? 'p-1' : detail ? 'p-3 sm:p-4' : 'p-1.5 sm:p-2'
  const labelClass =
    'absolute bottom-1 left-1 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:bottom-1.5 sm:left-1.5 sm:px-2 sm:text-[9px]'
  const lbl = labels ?? DEFAULT_LABELS

  return (
    <div
      className={`grid w-full ${cols} gap-px bg-black/10 ${className}`}
      style={{ backgroundColor: surface }}
    >
      {shots.map((src, i) => (
        <div
          key={src}
          className={`relative aspect-[3/4] overflow-hidden bg-[var(--bg)] ${pad}`}
        >
          <Image
            src={src}
            alt={`${alt} — ${lbl[i] ?? i + 1}`}
            fill
            className="object-contain transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width:640px) 30vw, 20vw"
          />
          <span className={labelClass}>{lbl[i] ?? `View ${i + 1}`}</span>
        </div>
      ))}
    </div>
  )
}
