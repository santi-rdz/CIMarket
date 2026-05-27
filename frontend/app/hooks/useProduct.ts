'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getProduct, getProducts } from '@/app/services/productApi'
import type { ActiveFilters, SortOption } from '@/app/types/filters'
import type { ProductDetail } from '@/app/types/product'

const SORT_PARAMS: Record<
  SortOption,
  { sortBy?: 'price' | 'createdAt' | 'title'; order?: 'asc' | 'desc' }
> = {
  recent: { sortBy: 'createdAt', order: 'desc' },
  price_asc: { sortBy: 'price', order: 'asc' },
  price_desc: { sortBy: 'price', order: 'desc' },
}

export function useInfiniteProducts(filters: ActiveFilters, limit: number) {
  return useInfiniteQuery({
    queryKey: [
      'products',
      limit,
      filters.search,
      filters.sort,
      filters.categoryIds.join(','),
      filters.condition,
      filters.campusIds.join(','),
      filters.minPrice,
      filters.maxPrice,
    ],
    queryFn: ({ pageParam, signal }) =>
      getProducts(
        {
          page: pageParam as number,
          limit,
          status: 'DISPONIBLE',
          search: filters.search || undefined,
          categoryIds:
            filters.categoryIds.length > 0
              ? (filters.categoryIds as unknown as number[])
              : undefined,
          condition: filters.condition,
          campusIds:
            filters.campusIds.length > 0
              ? (filters.campusIds as unknown as number[])
              : undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          ...SORT_PARAMS[filters.sort],
        },
        { signal },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })
}

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
      const res = await getProducts(
        { categoryIds: [categoryId!], limit: 6, status: 'DISPONIBLE' },
        { token: token ?? undefined },
      )
      return res.data.filter((p) => p.id !== excludeId)
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  })
}
