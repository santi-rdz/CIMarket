'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/app/components/ProductCard'
import { getProducts } from '@/app/services/productApi'
import type { ActiveFilters, SortOption } from '@/app/types/filters'
import NewProductModal from '@/app/components/NewProductModal'

// ─── Sort params map ──────────────────────────────────────────────────────────

const SORT_PARAMS: Record<
  SortOption,
  { sortBy?: 'price' | 'createdAt' | 'title'; order?: 'asc' | 'desc' }
> = {
  recent: { sortBy: 'createdAt', order: 'desc' },
  price_asc: { sortBy: 'price', order: 'asc' },
  price_desc: { sortBy: 'price', order: 'desc' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcLimit() {
  const cols =
    window.innerWidth >= 1536 ? 6
    : window.innerWidth >= 1280 ? 5
    : window.innerWidth >= 1024 ? 4
    : window.innerWidth >= 640 ? 3
    : 2
  const gap = 20
  const pagePadding = 48
  const cardWidth = (window.innerWidth - pagePadding - gap * (cols - 1)) / cols
  const cardHeight = cardWidth + 80
  const rows = Math.ceil(window.innerHeight / (cardHeight + gap)) + 1
  return Math.max(rows * cols, 10)
}

// ─── Skeleton — matches exact card shape ─────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image — exact same aspect-square + rounded-2xl as ProductCard */}
      <div className="mb-3 aspect-square rounded-2xl bg-slate-100" />
      {/* Title — two-line clamp approximation */}
      <div className="mb-2 space-y-1.5">
        <div className="h-3.5 w-5/6 rounded-md bg-slate-100" />
        <div className="h-3.5 w-3/4 rounded-md bg-slate-100" />
      </div>
      {/* Price */}
      <div className="mb-2 h-4 w-1/3 rounded-md bg-slate-100" />
      {/* Category + campus row */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-1/4 rounded-md bg-slate-100" />
        <div className="h-3 w-2/5 rounded-md bg-slate-100" />
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, search }: { hasFilters: boolean; search?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      {/* Simple illustration */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-30">
        <circle cx="34" cy="34" r="22" stroke="#94a3b8" strokeWidth="3" />
        <line x1="50" y1="50" x2="68" y2="68" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {hasFilters ? (
          <line x1="26" y1="34" x2="42" y2="34" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <>
            <line x1="34" y1="26" x2="34" y2="42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="34" x2="42" y2="34" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </svg>

      <div className="space-y-1">
        <p className="txt-4 font-semibold text-slate-700">
          {search
            ? `Sin resultados para "${search}"`
            : hasFilters
              ? 'Sin productos con esos filtros'
              : 'Aún no hay productos'}
        </p>
        <p className="txt-5 text-slate-400 max-w-xs">
          {search
            ? 'Prueba con otras palabras o elimina los filtros.'
            : hasFilters
              ? 'Intenta ajustar o limpiar los filtros.'
              : '¡Sé el primero en publicar algo!'}
        </p>
      </div>

      {!hasFilters && !search && (
        <NewProductModal trigger={{ size: 'sm', label: 'Publicar ahora' }} />
      )}
    </div>
  )
}

// ─── Grid ────────────────────────────────────────────────────────────────────

const GRID = 'grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'

type Props = {
  filters: ActiveFilters
  onTotalChange?: (total: number) => void
}

export default function ProductGrid({ filters, onTotalChange }: Props) {
  const [limit] = useState(calcLimit)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
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
      getProducts({
        page: pageParam as number,
        limit,
        status: 'DISPONIBLE',
        search: filters.search || undefined,
        categoryIds: filters.categoryIds.length > 0 ? (filters.categoryIds as unknown as number[]) : undefined,
        condition: filters.condition,
        campusIds: filters.campusIds.length > 0 ? (filters.campusIds as unknown as number[]) : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        ...SORT_PARAMS[filters.sort],
      }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '120px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const total = data?.pages[0]?.total
  useEffect(() => {
    if (total !== undefined) onTotalChange?.(total)
  }, [total, onTotalChange])

  const seen = new Set<string>()
  const products = (data?.pages.flatMap((p) => p.data) ?? []).filter(({ id }) => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  const hasFilters =
    filters.categoryIds.length > 0 ||
    filters.condition !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.campusIds.length > 0

  if (status === 'pending') {
    return (
      <div className={GRID}>
        {Array.from({ length: limit }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p className="py-20 text-center txt-5 text-slate-400">
        No se pudieron cargar los productos.
      </p>
    )
  }

  if (products.length === 0) {
    return <EmptyState hasFilters={hasFilters} search={filters.search} />
  }

  return (
    <>
      <div className={GRID}>
        {products.map((product) => (
          <Link key={product.id} href={`/productos/${product.slug}`}>
            <ProductCard product={product} />
          </Link>
        ))}
        {isFetchingNextPage &&
          Array.from({ length: limit }).map((_, i) => <CardSkeleton key={`sk-${i}`} />)}
      </div>
      <div ref={sentinelRef} />
    </>
  )
}
