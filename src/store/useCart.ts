'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  slug?: string
  title: string
  price: number
  qty: number
  size: string
  color?: string
  imageTone?: string
  previewImage?: string
  /** Compressed print artwork for cart / WhatsApp PDF page 2. */
  printArtwork?: string
  printAspectRatio?: number
}

type CartStore = {
  items: CartItem[]
  wishlist: string[]
  recentlyViewed: string[]
  coupon: string | null
  add: (item: Omit<CartItem, 'id'> & { id?: string }) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  toggleWishlist: (id: string) => void
  addRecentlyViewed: (slug: string) => void
  setCoupon: (code: string | null) => void
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      wishlist: [],
      recentlyViewed: [],
      coupon: null,
      add: (item) =>
        set((s) => {
          const existing = s.items.find(
            (i) => i.slug === item.slug && i.size === item.size && i.color === item.color,
          )
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === existing.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
              ),
            }
          }
          return {
            items: [
              ...s.items,
              {
                ...item,
                id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                qty: item.qty || 1,
              },
            ],
          }
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items: qty < 1 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((x) => x !== id)
            : [...s.wishlist, id],
        })),
      addRecentlyViewed: (slug) =>
        set((s) => ({
          recentlyViewed: [slug, ...s.recentlyViewed.filter((x) => x !== slug)].slice(0, 8),
        })),
      setCoupon: (code) => set({ coupon: code }),
    }),
    {
      name: 'aasha-cart',
      version: 3,
      migrate: (persisted) => {
        const s = persisted as Partial<CartStore> | undefined
        if (!s) return { items: [], wishlist: [], recentlyViewed: [], coupon: null } as Partial<CartStore>
        return {
          ...s,
          items: (s.items ?? []).map((i) => {
            let next = { ...i }
            if (next.previewImage && next.previewImage.length > 60_000) {
              next = { ...next, previewImage: undefined }
            }
            if (next.printArtwork && next.printArtwork.length > 200_000) {
              next = { ...next, printArtwork: undefined }
            }
            return next
          }),
        }
      },
    },
  ),
)

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
