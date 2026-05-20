'use client'

import Link from 'next/link'
import ProductCard from '@/app/components/ProductCard'
import { useRelatedProducts } from '@/app/hooks/useProduct'

interface Props {
  categoryId: number
  categoryName: string
  excludeId: string
}

export default function RelatedProducts({ categoryId, categoryName, excludeId }: Props) {
  const { data: products, isLoading } = useRelatedProducts(categoryId, excludeId)

  if (isLoading) {
    return (
      <section className="mt-14 border-t border-slate-100 pt-8">
        <h2 className="mb-6 txt-3 font-bold text-slate-900">Más en {categoryName}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-2xl bg-slate-100" />
              <div className="mt-3 h-4 w-3/4 rounded-lg bg-slate-100" />
              <div className="mt-2 h-4 w-1/3 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <section className="mt-14 border-t border-slate-100 pt-8">
      <h2 className="mb-6 txt-3 font-bold text-slate-900">Más en {categoryName}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <Link key={product.id} href={`/productos/${product.slug}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  )
}
