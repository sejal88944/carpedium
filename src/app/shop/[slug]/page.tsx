import type { Metadata } from 'next'
import { ProductDetail } from '@/components/shop/ProductDetail'
import { CATALOG, getProduct } from '@/data/products'
import { pageMeta, productJsonLd } from '@/lib/seo'

type PageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return pageMeta({
    title: product.title,
    description: product.description,
    path: `/shop/${product.slug}`,
  })
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProduct(slug)

  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
        />
      ) : null}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <ProductDetail slug={slug} />
      </div>
    </>
  )
}
