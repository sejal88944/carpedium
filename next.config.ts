import type { NextConfig } from 'next'

/** Dev-only: avoids Windows EPERM on `.next/trace` when another Node process still locks `.next`. */
const distDir = process.env.NEXT_DIST_DIR

const nextConfig: NextConfig = {
  ...(distDir ? { distDir } : {}),
  webpack: (config, { dev }) => {
    // Dev: slow Windows machines can hit default chunk load timeouts on large layout bundles.
    if (dev) {
      config.output = config.output || {}
      config.output.chunkLoadTimeout = 120_000
    }
    return config
  },
  // On low-RAM Windows PCs use: npm run build:lite (skips lint + TS gate; compile still runs).
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TS_CHECK === '1',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_DISABLE_ESLINT === '1',
  },
  async rewrites() {
    // Whitelist only Express backend endpoints — let /api/auth/* and /api/admin/*
    // be handled by Next.js so NextAuth + admin routes work.
    const backend = 'http://127.0.0.1:8787'
    return [
      { source: '/api/products/:path*', destination: `${backend}/api/products/:path*` },
      { source: '/api/products', destination: `${backend}/api/products` },
      { source: '/api/orders/:path*', destination: `${backend}/api/orders/:path*` },
      { source: '/api/orders', destination: `${backend}/api/orders` },
      { source: '/api/contact', destination: `${backend}/api/contact` },
      { source: '/api/ai/:path*', destination: `${backend}/api/ai/:path*` },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}

export default nextConfig
