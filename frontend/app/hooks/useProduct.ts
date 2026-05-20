'use client'

import { useQuery } from '@tanstack/react-query'
import { getProduct, getProducts } from '@/app/services/productApi'
import type { ProductDetail } from '@/app/types/product'

export function useProduct(slug: string, initialData?: ProductDetail) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug, token ?? undefined),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    initialData,
  })
}

export function useRelatedProducts(categoryId: number | undefined, excludeId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  return useQuery({
    queryKey: ['relatedProducts', categoryId, excludeId],
    queryFn: async () => {
      const res = await getProducts({ categoryIds: [categoryId!], limit: 6 }, { token: token ?? undefined })
      return res.data.filter((p) => p.id !== excludeId)
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  })
}
