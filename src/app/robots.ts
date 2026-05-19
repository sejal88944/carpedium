import type { MetadataRoute } from 'next'
import { COMPANY } from '@/data/brand'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin'] },
    sitemap: `${COMPANY.siteUrl}/sitemap.xml`,
  }
}
