'use client'

import { useEffect, useRef, useState } from 'react'
import { useAdminStore, type AdminProduct, type AdminCategory, type AdminCoupon } from './useAdminStore'
import { CATALOG } from '@/data/products'
import { CATEGORIES } from '@/data/brand'
import type { Product } from '@/types'

/**
 * Seed the admin store with the existing storefront catalog on first mount.
 * - Only runs when the persisted store has zero products / zero categories.
 * - Safe across HMR & multiple mounts (guarded by a ref + persisted state).
 */
export function useSeedAdminStore() {
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true

    // Wait for zustand-persist hydration to finish before deciding.
    const tryHydrate = () => {
      const persist = useAdminStore.persist
      if (persist && !persist.hasHydrated()) {
        setTimeout(tryHydrate, 80)
        return
      }
      seedNow()
    }
    tryHydrate()
  }, [])
}

/** Default coupons surfaced to customers when admin hasn't added any yet. */
const SEED_COUPONS: Array<Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount'>> = [
  {
    code: 'WELCOME10',
    discountType: 'percent',
    discountValue: 10,
    minOrder: 0,
    active: true,
  },
  {
    code: 'BULK15',
    discountType: 'percent',
    discountValue: 15,
    minOrder: 2999,
    active: true,
  },
]

function seedNow() {
  const state = useAdminStore.getState()
  const updates: Partial<{
    products: AdminProduct[]
    categories: AdminCategory[]
    coupons: AdminCoupon[]
  }> = {}

  if (state.products.length === 0) {
    updates.products = CATALOG.map((p, i) => ({
      id: `seed-${p.slug}`,
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category as AdminProduct['category'],
      price: p.price,
      compareAt: p.compareAt,
      stock: 100,
      sizes: [...p.sizes],
      colors: [],
      image: p.image,
      surface: p.surface,
      tags: [...p.tags],
      featured: p.featured,
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    }))
  }

  if (state.categories.length === 0) {
    updates.categories = CATEGORIES.map((c, i) => ({
      id: `seed-${c.id}`,
      name: c.name,
      slug: c.slug,
      image: c.image,
      tagline: c.tagline,
      surface: c.surface,
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    }))
  }

  if (state.coupons.length === 0) {
    updates.coupons = SEED_COUPONS.map((c, i) => ({
      id: `seed-${c.code.toLowerCase()}`,
      usedCount: 0,
      ...c,
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    }))
  }

  if (Object.keys(updates).length > 0) useAdminStore.setState(updates)
}

/** Manual full re-seed (used by a “Reset to defaults” admin action). */
export function reseedAdminStore() {
  useAdminStore.setState({ products: [], categories: [], coupons: [] })
  seedNow()
}

/** Convert AdminProduct → storefront Product shape (1:1 mapping). */
function adminToStorefront(p: AdminProduct): Product {
  const fallbackTone = 'from-zinc-900 to-black'
  return {
    _id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    category: p.category,
    price: p.price,
    compareAt: p.compareAt,
    imageTone: fallbackTone,
    image: p.image,
    surface: p.surface,
    tags: p.tags ?? [],
    sizes: p.sizes,
    featured: p.featured,
  }
}

/**
 * Live storefront catalogue.
 * - During SSR (and before hydration): static CATALOG so pages still pre-render correctly.
 * - After hydration: the admin store (which is seeded with CATALOG on first mount).
 *
 * Storefront pages can call this in place of importing CATALOG directly to pick
 * up products that admins add / edit / delete in the panel.
 */
export function useStorefrontProducts(): Product[] {
  const [hydrated, setHydrated] = useState(false)
  const storeProducts = useAdminStore((s) => s.products)

  useEffect(() => {
    const persist = useAdminStore.persist
    if (persist && !persist.hasHydrated()) {
      const unsub = persist.onFinishHydration(() => setHydrated(true))
      if (persist.hasHydrated()) setHydrated(true)
      return unsub
    }
    setHydrated(true)
  }, [])

  if (!hydrated) return CATALOG
  if (storeProducts.length === 0) return CATALOG
  return storeProducts.map(adminToStorefront)
}

