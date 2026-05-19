import Script from 'next/script'

/**
 * FREE analytics — Google Analytics 4. Only renders when NEXT_PUBLIC_GA_ID is set.
 * Pair with Google Search Console (also free) for ranking insights.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
