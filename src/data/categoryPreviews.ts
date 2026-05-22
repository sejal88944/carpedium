/** Sidebar / spotlight previews — 2–3 images in one card per category. */
export type CategoryPreview = {
  slug: string
  title: string
  images: string[]
  labels?: string[]
  surface?: string
}

export const MENS_CATEGORY_PREVIEW: CategoryPreview = {
  slug: 'men-cockroach-janta-party',
  title: 'Cockroach Janta Party Tee',
  images: ['/designs/men/men-cockroach-front.png', '/designs/men/men-cockroach-back.png'],
  labels: ['Front', 'Back'],
  surface: '#e8e8e6',
}

export const CATEGORY_PREVIEWS: Partial<Record<string, CategoryPreview>> = {
  'Men T-Shirts': MENS_CATEGORY_PREVIEW,
}
