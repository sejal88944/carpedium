'use client'

import { ProductGalleryImage } from './ProductGalleryImage'

type Props = {
  front: string
  back: string
  alt: string
  surface?: string
  detail?: boolean
  className?: string
}

/** @deprecated Use ProductGalleryImage — kept for imports. */
export function ProductDualImage({ front, back, alt, surface, detail, className }: Props) {
  return (
    <ProductGalleryImage
      images={[front, back]}
      labels={['Front', 'Back']}
      alt={alt}
      surface={surface}
      detail={detail}
      className={className}
    />
  )
}
