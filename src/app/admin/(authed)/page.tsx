'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  Wallet,
  Hourglass,
  Users,
  Truck,
  Shirt,
  ArrowUpRight,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react'
import {
  AdminPageHeader,
  StatCard,
  Card,
  SectionTitle,
  EmptyState,
  StatusBadge,
} from '@/components/admin/AdminUI'
import { useAdminStore } from '@/store/useAdminStore'

export default function DashboardPage() {
  const orders = useAdminStore((s) => s.orders)
  const products = useAdminStore((s) => s.products)
  const customers = useAdminStore((s) => s.customers)
  const bulkOrders = useAdminStore((s) => s.bulkOrders)
  const uploads = useAdminStore((s) => s.uploads)
  const messages = useAdminStore((s) => s.messages)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const revenue = orders
      .filter((o) => o.payment === 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const pending = orders.filter((o) =>
      ['confirmed', 'printing', 'quality-check', 'packed'].includes(o.status),
    ).length
    return {
      totalOrders,
      revenue,
      pending,
      customers: customers.length,
      bulkOrders: bulkOrders.length,
      activeProducts: products.length,
      messages: messages.length,
      pendingUploads: uploads.filter((u) => u.status === 'pending').length,
    }
  }, [orders, products, customers, bulkOrders, messages, uploads])

  const recentOrders = orders.slice(0, 6)
  const recentBulk = bulkOrders.slice(0, 5)
  const recentMessages = messages.slice(0, 5)
  const recentUploads = uploads.slice(0, 4)

  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${n.toLocaleString('en-IN')}`

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Live overview — orders, inquiries, messages and uploads update in real time."
      />

      {/* Top KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(hydrated ? stats.totalOrders : 0)}
          icon={Package}
          tone="sky"
          index={0}
        />
        <StatCard
          label="Revenue (paid)"
          value={hydrated ? fmt(stats.revenue) : '₹0'}
          icon={Wallet}
          tone="emerald"
          index={1}
        />
        <StatCard
          label="Pending Orders"
          value={String(hydrated ? stats.pending : 0)}
          icon={Hourglass}
          tone="amber"
          index={2}
        />
        <StatCard
          label="Customers"
          value={String(hydrated ? stats.customers : 0)}
          icon={Users}
          tone="violet"
          index={3}
        />
      </div>

      {/* Lead / inquiry strip — what needs an owner reply */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bulk Inquiries"
          value={String(hydrated ? stats.bulkOrders : 0)}
          icon={Truck}
          tone="fuchsia"
          index={0}
        />
        <StatCard
          label="Contact Messages"
          value={String(hydrated ? stats.messages : 0)}
          icon={MessageSquare}
          tone="sky"
          index={1}
        />
        <StatCard
          label="Pending Uploads"
          value={String(hydrated ? stats.pendingUploads : 0)}
          icon={ImageIcon}
          tone="amber"
          index={2}
        />
        <StatCard
          label="Active Products"
          value={String(hydrated ? stats.activeProducts : 0)}
          icon={Shirt}
          tone="rose"
          index={3}
        />
      </div>

      {/* Recent orders + Bulk inquiries */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            action={
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            Recent orders
          </SectionTitle>
          {hydrated && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                    <th className="pb-3 pr-3 font-bold">Order</th>
                    <th className="pb-3 pr-3 font-bold">Customer</th>
                    <th className="pb-3 pr-3 font-bold">Product</th>
                    <th className="pb-3 pr-3 font-bold">Total</th>
                    <th className="pb-3 pr-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-slate-100 last:border-0 dark:border-white/5"
                    >
                      <td className="py-3 pr-3 font-mono text-xs font-bold">#{o.code}</td>
                      <td className="py-3 pr-3">{o.customer}</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{o.product}</td>
                      <td className="py-3 pr-3 font-bold">₹{o.total.toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={hydrated ? 'No orders yet' : 'Loading...'}
              description={
                hydrated ? 'Orders placed through WhatsApp appear here.' : undefined
              }
            />
          )}
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link
                href="/admin/bulk-orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand"
              >
                All <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" /> Bulk inquiries
            </span>
          </SectionTitle>
          {hydrated && recentBulk.length > 0 ? (
            <div className="space-y-3">
              {recentBulk.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-white/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{b.company}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {b.contactName} · {b.city}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {b.quantity.toLocaleString('en-IN')} pcs · {b.printingType}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <Phone className="h-3 w-3" /> {b.phone}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <Truck className="h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold">No bulk inquiries yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Submissions from the public Bulk Order form land here.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Contact messages + customer uploads */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            action={
              <Link
                href="/admin/messages"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" /> Contact messages
            </span>
          </SectionTitle>
          {hydrated && recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-100 p-4 dark:border-white/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-bold">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.createdAt.slice(0, 10)}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ''}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {m.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold">No messages yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Inquiries from the Contact page appear here.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link
                href="/admin/uploads"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand"
              >
                All <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          >
            Customer uploads
          </SectionTitle>
          {hydrated && recentUploads.length > 0 ? (
            <div className="space-y-3">
              {recentUploads.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/5"
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: u.url ? `url(${u.url})` : undefined,
                      backgroundColor: u.url ? undefined : '#f1f5f9',
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{u.label}</p>
                    <p className="truncate text-xs text-slate-500">{u.customerName || '—'}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <ImageIcon className="h-10 w-10 text-slate-300" />
              <p className="mt-3 font-bold">No uploads yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Custom designs from the Designer land here.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
