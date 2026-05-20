import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: 'Carpe Diem Admin Panel',
  robots: { index: false, follow: false },
}

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <AdminShell
      adminName={session.user.name || 'Admin'}
      adminEmail={session.user.email || ''}
    >
      {children}
    </AdminShell>
  )
}
