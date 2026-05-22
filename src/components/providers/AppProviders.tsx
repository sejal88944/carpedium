'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PublicChrome } from '@/components/layout/PublicChrome'
import { useSeedAdminStore } from '@/store/adminSeed'

function StorefrontCatalogInit() {
  useSeedAdminStore()
  return null
}

/** Root client shell — split from `app/layout` so `layout.js` stays small (avoids ChunkLoadError timeouts). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <StorefrontCatalogInit />
        <PublicChrome>{children}</PublicChrome>
      </ThemeProvider>
    </SessionProvider>
  )
}
