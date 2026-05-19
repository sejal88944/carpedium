import { COMPANY, SEO_KEYWORDS } from '@/data/brand'
import type { Product } from '@/types'

export function pageMeta(opts: {
  title: string
  description?: string
  path?: string
  image?: string
}) {
  const title = `${opts.title} | ${COMPANY.shortName}`
  const description = opts.description || COMPANY.description
  const url = `${COMPANY.siteUrl}${opts.path || ''}`
  const image = opts.image || `${COMPANY.siteUrl}/og-default.jpg`

  return {
    title,
    description,
    keywords: SEO_KEYWORDS.join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: COMPANY.name,
      type: 'website',
      locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  }
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    description: COMPANY.description,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    url: COMPANY.siteUrl,
    priceRange: '₹₹',
    areaServed: COMPANY.locations.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: COMPANY.rating,
      reviewCount: COMPANY.reviewCount,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
  }
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function productJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.slug,
    brand: { '@type': 'Brand', name: COMPANY.shortName },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${COMPANY.siteUrl}/shop/${product.slug}`,
    },
  }
}

export function articleJsonLd(post: {
  title: string
  excerpt: string
  slug: string
  date: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: COMPANY.name },
    publisher: { '@type': 'Organization', name: COMPANY.name },
    mainEntityOfPage: `${COMPANY.siteUrl}/blog/${post.slug}`,
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
