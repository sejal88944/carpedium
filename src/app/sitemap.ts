import type { MetadataRoute } from 'next'
import { COMPANY } from '@/data/brand'
import { CATALOG } from '@/data/products'
import { BLOG_POSTS } from '@/data/blog'

const staticRoutes = [
  '',
  '/shop',
  '/design',
  '/bulk-orders',
  '/corporate',
  '/about',
  '/contact',
  '/faq',
  '/blog',
  '/cart',
  '/account',
  '/admin',
  '/privacy',
  '/terms',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = COMPANY.siteUrl
  const staticPages = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
    priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.8,
  }))

  const products = CATALOG.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const posts = BLOG_POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...products, ...posts]
}
