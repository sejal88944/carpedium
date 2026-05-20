'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Entity types ────────────────────────────────────────────────────────────

export type AdminProduct = {
  id: string
  slug: string
  title: string
  description?: string
  category: 'Men T-Shirts' | 'Women T-Shirts' | 'Couple T-Shirts'
  price: number
  compareAt?: number
  discount?: number
  stock?: number
  sizes: string[]
  colors?: string[]
  image?: string
  surface?: string
  tags?: string[]
  featured?: boolean
  createdAt: string
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  image?: string
  tagline?: string
  surface?: string
  createdAt: string
}

export type AdminCoupon = {
  id: string
  code: string
  discountType: 'percent' | 'flat'
  discountValue: number
  minOrder?: number
  expiresAt?: string
  usageLimit?: number
  usedCount: number
  active: boolean
  createdAt: string
}

export type AdminBlog = {
  id: string
  slug: string
  title: string
  excerpt?: string
  body?: string
  cover?: string
  author?: string
  category?: string
  metaTitle?: string
  metaDescription?: string
  published: boolean
  publishedAt?: string
  createdAt: string
}

export type OrderStatus =
  | 'confirmed'
  | 'printing'
  | 'quality-check'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type AdminOrder = {
  id: string
  code: string
  customer: string
  email?: string
  phone?: string
  product: string
  qty: number
  total: number
  status: OrderStatus
  payment: 'paid' | 'pending'
  note?: string
  createdAt: string
}

export type AdminBulkOrder = {
  id: string
  company: string
  contactName: string
  email: string
  phone: string
  city: string
  quantity: number
  printingType: string
  logoUrl?: string
  note?: string
  status: 'new' | 'quoted' | 'won' | 'lost'
  createdAt: string
}

export type AdminCustomer = {
  id: string
  name: string
  email: string
  phone?: string
  /** Shipping / billing address (full line). */
  address?: string
  city?: string
  ordersCount: number
  totalSpent: number
  lastOrderAt?: string
  createdAt: string
}

export type AdminUpload = {
  id: string
  type: 'logo' | 'image' | 'text'
  label: string
  url: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  productSlug?: string
  /** Data URL of the generated design PDF (used to view/download from admin). */
  pdfUrl?: string
  pdfFileName?: string
  /** Transparent print-ready PNG (artwork only). */
  printArtworkUrl?: string
  /** Full mockup preview PNG. */
  mockupPreviewUrl?: string
  /** Fabric design JSON for re-editing. */
  designJson?: string
  orderId?: string
  printType?: string
  /** Order context captured at submission time. */
  color?: string
  size?: string
  quantity?: number
  price?: number
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export type AdminReview = {
  id: string
  productSlug?: string
  customerName: string
  rating: number
  title?: string
  body?: string
  approved: boolean
  createdAt: string
}

export type AdminMessage = {
  id: string
  name: string
  email: string
  phone?: string
  body: string
  createdAt: string
}

// ── Store ───────────────────────────────────────────────────────────────────

type State = {
  products: AdminProduct[]
  categories: AdminCategory[]
  coupons: AdminCoupon[]
  blogs: AdminBlog[]
  orders: AdminOrder[]
  bulkOrders: AdminBulkOrder[]
  customers: AdminCustomer[]
  uploads: AdminUpload[]
  reviews: AdminReview[]
  messages: AdminMessage[]
}

type Actions = {
  // Products
  addProduct: (p: Omit<AdminProduct, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, patch: Partial<AdminProduct>) => void
  deleteProduct: (id: string) => void

  // Categories
  addCategory: (c: Omit<AdminCategory, 'id' | 'createdAt'>) => void
  updateCategory: (id: string, patch: Partial<AdminCategory>) => void
  deleteCategory: (id: string) => void

  // Coupons
  addCoupon: (c: Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount' | 'active'> & { active?: boolean }) => void
  toggleCoupon: (id: string) => void
  deleteCoupon: (id: string) => void

  // Blogs
  addBlog: (b: Omit<AdminBlog, 'id' | 'createdAt'>) => void
  updateBlog: (id: string, patch: Partial<AdminBlog>) => void
  deleteBlog: (id: string) => void

  // Orders
  addOrder: (o: Omit<AdminOrder, 'id' | 'createdAt'>) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  deleteOrder: (id: string) => void

  // Bulk orders
  addBulkOrder: (b: Omit<AdminBulkOrder, 'id' | 'createdAt'>) => void
  updateBulkOrderStatus: (id: string, status: AdminBulkOrder['status']) => void
  deleteBulkOrder: (id: string) => void

  // Customers
  addCustomer: (c: Omit<AdminCustomer, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'>) => void
  upsertCustomer: (
    c: Omit<AdminCustomer, 'id' | 'createdAt' | 'ordersCount' | 'totalSpent'> & {
      addOrder?: { total?: number; at?: string }
    },
  ) => void
  deleteCustomer: (id: string) => void

  // Uploads
  addUpload: (u: Omit<AdminUpload, 'id' | 'createdAt' | 'status'> & { status?: AdminUpload['status'] }) => void
  setUploadStatus: (id: string, status: AdminUpload['status']) => void
  deleteUpload: (id: string) => void

  // Reviews
  addReview: (r: Omit<AdminReview, 'id' | 'createdAt' | 'approved'> & { approved?: boolean }) => void
  toggleReviewApproval: (id: string) => void
  deleteReview: (id: string) => void

  // Contact messages
  addMessage: (m: Omit<AdminMessage, 'id' | 'createdAt'>) => void
  deleteMessage: (id: string) => void

  resetAll: () => void
}

const id = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2))
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().slice(0, 10)

const EMPTY: State = {
  products: [],
  categories: [],
  coupons: [],
  blogs: [],
  orders: [],
  bulkOrders: [],
  customers: [],
  uploads: [],
  reviews: [],
  messages: [],
}

export const useAdminStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...EMPTY,

      addProduct: (p) =>
        set((s) => ({ products: [{ id: id(), createdAt: now(), ...p }, ...s.products] })),
      updateProduct: (pid, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === pid ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (pid) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== pid) })),

      addCategory: (c) =>
        set((s) => ({ categories: [{ id: id(), createdAt: now(), ...c }, ...s.categories] })),
      updateCategory: (cid, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === cid ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (cid) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== cid) })),

      addCoupon: (c) =>
        set((s) => ({
          coupons: [
            { id: id(), createdAt: now(), usedCount: 0, active: c.active ?? true, ...c },
            ...s.coupons,
          ],
        })),
      toggleCoupon: (cid) =>
        set((s) => ({
          coupons: s.coupons.map((c) => (c.id === cid ? { ...c, active: !c.active } : c)),
        })),
      deleteCoupon: (cid) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== cid) })),

      addBlog: (b) =>
        set((s) => ({
          blogs: [
            {
              id: id(),
              createdAt: now(),
              publishedAt: b.published ? today() : undefined,
              ...b,
            },
            ...s.blogs,
          ],
        })),
      updateBlog: (bid, patch) =>
        set((s) => ({ blogs: s.blogs.map((b) => (b.id === bid ? { ...b, ...patch } : b)) })),
      deleteBlog: (bid) =>
        set((s) => ({ blogs: s.blogs.filter((b) => b.id !== bid) })),

      addOrder: (o) =>
        set((s) => ({ orders: [{ id: id(), createdAt: now(), ...o }, ...s.orders] })),
      updateOrderStatus: (oid, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === oid ? { ...o, status } : o)),
        })),
      deleteOrder: (oid) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== oid) })),

      addBulkOrder: (b) =>
        set((s) => ({ bulkOrders: [{ id: id(), createdAt: now(), ...b }, ...s.bulkOrders] })),
      updateBulkOrderStatus: (bid, status) =>
        set((s) => ({
          bulkOrders: s.bulkOrders.map((b) => (b.id === bid ? { ...b, status } : b)),
        })),
      deleteBulkOrder: (bid) =>
        set((s) => ({ bulkOrders: s.bulkOrders.filter((b) => b.id !== bid) })),

      addCustomer: (c) =>
        set((s) => ({
          customers: [
            { id: id(), createdAt: now(), ordersCount: 0, totalSpent: 0, ...c },
            ...s.customers,
          ],
        })),
      upsertCustomer: (c) =>
        set((s) => {
          const key = (v?: string) => (v || '').trim().toLowerCase()
          const phone = key(c.phone)
          const email = key(c.email)
          const idx = s.customers.findIndex(
            (x) => (phone && key(x.phone) === phone) || (email && key(x.email) === email),
          )
          if (idx === -1) {
            const next: AdminCustomer = {
              id: id(),
              createdAt: now(),
              ordersCount: c.addOrder ? 1 : 0,
              totalSpent: c.addOrder?.total ?? 0,
              lastOrderAt: c.addOrder?.at,
              name: c.name,
              email: c.email,
              phone: c.phone,
              address: c.address?.trim() || undefined,
              city: c.city,
            }
            return { customers: [next, ...s.customers] }
          }
          const existing = s.customers[idx]
          const merged: AdminCustomer = {
            ...existing,
            name: c.name || existing.name,
            email: c.email || existing.email,
            phone: c.phone || existing.phone,
            address: (c.address?.trim() ? c.address.trim() : undefined) ?? existing.address,
            city: c.city || existing.city,
            ordersCount: existing.ordersCount + (c.addOrder ? 1 : 0),
            totalSpent: existing.totalSpent + (c.addOrder?.total ?? 0),
            lastOrderAt: c.addOrder?.at ?? existing.lastOrderAt,
          }
          const customers = [...s.customers]
          customers[idx] = merged
          return { customers }
        }),
      deleteCustomer: (cid) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== cid) })),

      addUpload: (u) =>
        set((s) => ({
          uploads: [
            { id: id(), createdAt: now(), status: u.status ?? 'pending', ...u },
            ...s.uploads,
          ],
        })),
      setUploadStatus: (uid, status) =>
        set((s) => ({
          uploads: s.uploads.map((u) => (u.id === uid ? { ...u, status } : u)),
        })),
      deleteUpload: (uid) =>
        set((s) => ({ uploads: s.uploads.filter((u) => u.id !== uid) })),

      addReview: (r) =>
        set((s) => ({
          reviews: [
            { id: id(), createdAt: now(), approved: r.approved ?? false, ...r },
            ...s.reviews,
          ],
        })),
      toggleReviewApproval: (rid) =>
        set((s) => ({
          reviews: s.reviews.map((r) => (r.id === rid ? { ...r, approved: !r.approved } : r)),
        })),
      deleteReview: (rid) =>
        set((s) => ({ reviews: s.reviews.filter((r) => r.id !== rid) })),

      addMessage: (m) =>
        set((s) => ({ messages: [{ id: id(), createdAt: now(), ...m }, ...s.messages] })),
      deleteMessage: (mid) =>
        set((s) => ({ messages: s.messages.filter((m) => m.id !== mid) })),

      resetAll: () => set({ ...EMPTY }),
    }),
    {
      name: 'aasha-admin-store',
      version: 3,
      migrate: (persisted) => {
        const s = persisted as Partial<State>
        return { ...EMPTY, ...s, messages: s?.messages ?? [], uploads: s?.uploads ?? [] }
      },
    },
  ),
)

/** Safe hook to use the store after hydration on the client (prevents SSR mismatch). */
export function useAdminHydrated() {
  if (typeof window === 'undefined') return false
  return useAdminStore.persist?.hasHydrated() ?? true
}
