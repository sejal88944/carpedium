'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PublicChrome } from '@/components/layout/PublicChrome'

/** Root client shell — split from `app/layout` so `layout.js` stays small (avoids ChunkLoadError timeouts). */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PublicChrome>{children}</PublicChrome>
      </ThemeProvider>
    </SessionProvider>
  )
}
