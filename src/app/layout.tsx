import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter, Syne } from 'next/font/google'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { COMPANY } from '@/data/brand'
import { localBusinessJsonLd } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })

const AppProviders = dynamic(() => import('@/components/providers/AppProviders').then((m) => m.AppProviders), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" aria-hidden />,
})

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.siteUrl),
  title: {
    default: `${COMPANY.shortName} | Custom T-Shirt Printing India`,
    template: `%s | ${COMPANY.shortName}`,
  },
  description: COMPANY.description,
  keywords: [
    'custom t shirt printing',
    'corporate t shirt printing',
    'bulk t shirt printing',
    'custom tshirts Pune',
    'polo t shirt printing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: COMPANY.name,
  },
  robots: { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION }
    : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
        <link rel="icon" href={COMPANY.logo} type="image/png" />
        <link rel="apple-touch-icon" href={COMPANY.logo} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Oswald:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Pacifico&family=Caveat:wght@400;700&family=Permanent+Marker&family=Press+Start+2P&family=Lobster&family=Dancing+Script:wght@400;700&family=Righteous&family=Bungee&family=Audiowide&family=Bowlby+One&family=Russo+One&family=Monoton&family=Special+Elite&family=Shrikhand&family=Mukta:wght@400;700;800&family=Tiro+Devanagari+Marathi&family=Rozha+One&family=Yatra+One&family=Baloo+2:wght@400;700;800&family=Orbitron:wght@400;700;900&family=Black+Ops+One&family=Fjalla+One&family=Abril+Fatface&family=Bangers&family=Creepster&family=Faster+One&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${syne.variable}`}>
        <AppProviders>{children}</AppProviders>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
