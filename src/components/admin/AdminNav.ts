import {
  LayoutDashboard,
  Package,
  Shirt,
  Tag,
  Upload,
  Users,
  Ticket,
  LogOut,
  Truck,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

// Sorted by business priority — what the owner needs to action first comes first.
// 1) Live work: Orders, Bulk inquiries, Contact messages, Customer uploads
// 2) Catalog management: Products, Categories
// 3) Audience & marketing: Customers, Coupons
export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/bulk-orders', label: 'Bulk Inquiries', icon: Truck },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/uploads', label: 'Customer Uploads', icon: Upload },
  { href: '/admin/products', label: 'Products', icon: Shirt },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
]

export const ADMIN_LOGOUT_ITEM = { href: '/admin/logout', label: 'Logout', icon: LogOut }
