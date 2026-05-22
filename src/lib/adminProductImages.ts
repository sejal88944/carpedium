import type { AdminProduct } from '@/store/useAdminStore'

const MAX_DATA_URL_LEN = 450_000

/** Normalize photos for admin save + storefront gallery. */
export function buildProductImageFields(images: string[]) {
  const clean = images.map((u) => u.trim()).filter(Boolean).slice(0, 5)
  for (const u of clean) {
    if (u.startsWith('data:') && u.length > MAX_DATA_URL_LEN) {
      throw new Error(
        'Image file is too large for browser storage. Upload via Cloudinary or use a smaller image / URL.',
      )
    }
  }
  return {
    images: clean,
    image: clean[0],
    imageBack: clean[1],
    gallery: clean.length >= 2 ? clean.slice(0, 3) : undefined,
  }
}

export function productImagesFromAdmin(p: AdminProduct): string[] {
  if (p.images && p.images.length > 0) return p.images
  if (p.gallery && p.gallery.length > 0) return [...p.gallery]
  if (p.image && p.imageBack) return [p.image, p.imageBack]
  if (p.image) return [p.image]
  return []
}
