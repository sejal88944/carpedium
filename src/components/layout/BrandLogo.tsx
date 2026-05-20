import Image from 'next/image'
import Link from 'next/link'
import { COMPANY } from '@/data/brand'

type BrandLogoProps = {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { img: 40, text: 'text-base' },
  md: { img: 52, text: 'text-lg' },
  lg: { img: 72, text: 'text-2xl' },
}

export function BrandLogo({ href = '/', size = 'md', showText = true, className = '' }: BrandLogoProps) {
  const s = sizes[size]
  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src={COMPANY.logo}
        alt={`${COMPANY.shortName} logo`}
        width={s.img}
        height={s.img}
        className="rounded-full object-cover ring-2 ring-amber-500/40"
        priority={size !== 'sm'}
      />
      {showText ? (
        <span className="leading-tight">
          <span className={`block font-display font-bold tracking-tight text-gradient ${s.text}`}>
            {COMPANY.shortName}
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600/90 dark:text-amber-400/90 sm:block">
            Seize The Day
          </span>
        </span>
      ) : null}
    </span>
  )

  if (!href) return inner
  return (
    <Link href={href} className="transition hover:opacity-90">
      {inner}
    </Link>
  )
}
