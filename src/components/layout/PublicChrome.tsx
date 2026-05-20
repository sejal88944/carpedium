'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingCTA } from '@/components/layout/FloatingCTA'

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden pt-20 pb-safe-mobile md:pb-0">{children}</main>
      <Footer />
      <FloatingCTA />
    </>
  )
}
