export type Product = {
  _id?: string
  slug: string
  title: string
  description: string
  category: string
  price: number
  compareAt?: number
  imageTone: string
  image?: string
  surface?: string
  tags: string[]
  sizes: string[]
  featured?: boolean
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
