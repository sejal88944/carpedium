import type { Product } from '@/types'

export function productGalleryImages(product: Product): string[] | null {
  if (product.gallery && product.gallery.length >= 2) {
    return product.gallery.slice(0, 3)
  }
  if (product.image && product.imageBack) {
    return [product.image, product.imageBack]
  }
  return null
}
