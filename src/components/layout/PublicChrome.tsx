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

  const isDesign = pathname.startsWith('/design')

  return (
    <>
      <Navbar />
      <main
        className={`min-h-dvh w-full max-w-full overflow-x-hidden pt-16 sm:pt-20 ${
          isDesign ? 'pb-32 sm:pb-28 md:pb-8' : 'pb-safe-mobile md:pb-0'
        }`}
      >
        {children}
      </main>
      <Footer compactMobile={isDesign} />
      <FloatingCTA />
    </>
  )
}
