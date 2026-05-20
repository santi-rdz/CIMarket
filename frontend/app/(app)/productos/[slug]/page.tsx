import type { Metadata } from 'next'
import { fetchApi } from '@/app/lib/fetchApi'
import { SITE_URL } from '@/app/lib/constants'
import type { ProductDetail } from '@/app/types/product'
import ProductDetailClient from './components/ProductDetailClient'

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await fetchApi<ProductDetail>(`/products/${slug}`)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  const image = product.images[0]?.url
  const price = Number(product.price).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  return {
    title: product.title,
    description: product.description
      ? `${product.description.slice(0, 155)}${product.description.length > 155 ? '…' : ''}`
      : `${product.title} — ${price} en CIMarket`,
    openGraph: {
      title: `${product.title} — ${price}`,
      description: product.description?.slice(0, 200) ?? `Disponible en CIMarket`,
      type: 'website',
      url: `${SITE_URL}/productos/${product.slug}`,
      ...(image && { images: [{ url: image, alt: product.title }] }),
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images.map((img) => img.url),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'MXN',
          availability:
            product.status === 'DISPONIBLE'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
          url: `${SITE_URL}/productos/${product.slug}`,
        },
        category: product.category.name,
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient slug={slug} initialProduct={product ?? undefined} />
    </>
  )
}
