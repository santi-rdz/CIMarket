'use client'

import dynamic from 'next/dynamic'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { HiAdjustmentsHorizontal } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import FilterPanel from './FilterPanel'
import SortBy from './SortBy'
import ActiveFilterChips from './ActiveFilterChips'
import SearchBar from '@/app/components/SearchBar'
import type { ActiveFilters, SortOption } from '@/app/types/filters'
import { paramsToFilters, filtersToParams } from '@/app/types/filters'
import { useDefaultCampuses } from '@/app/hooks/useDefaultCampuses'
import { useMe } from '@/app/hooks/useMe'

const SORT_OPTIONS = [
  { value: 'recent' as SortOption, label: 'Más recientes' },
  { value: 'price_asc' as SortOption, label: 'Menor precio' },
  { value: 'price_desc' as SortOption, label: 'Mayor precio' },
]

const DEFAULT_SORT: SortOption = 'recent'

const ProductGrid = dynamic(() => import('./ProductGrid'), { ssr: false })

// Module-level: keyed by user ID so re-login triggers a fresh default application
let campusDefaultsAppliedForUser: string | null = null

export default function ProductGridWrapper() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = paramsToFilters(searchParams)

  // Apply profile/preference campus defaults once per user session when URL has none
  const { data: me } = useMe()
  const defaultCampuses = useDefaultCampuses()

  // Reset flag on logout so defaults re-apply on next login
  useEffect(() => {
    if (!me?.id) {
      campusDefaultsAppliedForUser = null
    }
  }, [me?.id])

  useEffect(() => {
    if (!me?.id) return
    if (campusDefaultsAppliedForUser === me.id || defaultCampuses.length === 0) return
    campusDefaultsAppliedForUser = me.id
    if (searchParams.has('campusIds')) return

    const qs = filtersToParams({ ...filters, campusIds: defaultCampuses }).toString()
    router.replace(`${pathname}?${qs}`, { scroll: false })
  }, [me?.id, defaultCampuses, searchParams, filters, router, pathname])

  const [filterOpen, setFilterOpen] = useState(false)
  const [total, setTotal] = useState<number | undefined>()

  const handleTotalChange = useCallback((n: number) => setTotal(n), [])

  function setFilters(next: ActiveFilters) {
    const qs = filtersToParams(next).toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const activeFilterCount = [
    filters.campusIds.length > 0,
    filters.categoryIds.length > 0,
    filters.condition !== undefined,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
  ].filter(Boolean).length

  return (
    <>
      <FilterPanel
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => setFilters({ ...next, search: filters.search })}
      />

      {/* SearchBar — mobile only (desktop shows in Header) */}
      <div className="mb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Toolbar — Airbnb-inspired sticky filter bar */}
      <div className="mb-6 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-3.5 py-2 txt-5 font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1',
              activeFilterCount > 0
                ? 'border-green-800 bg-green-800 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm',
            )}
          >
            <HiAdjustmentsHorizontal className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white text-[10px] font-bold leading-none text-green-800">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Inline active filter chips */}
          <ActiveFilterChips
            filters={filters}
            onRemove={(next) => setFilters({ ...next, search: filters.search })}
          />

          <div className="flex-1" />

          {total !== undefined && (
            <span className="txt-6 text-slate-400 shrink-0 tabular-nums">{total} resultados</span>
          )}

          <SortBy options={SORT_OPTIONS} defaultValue={DEFAULT_SORT} />
        </div>
      </div>

      <ProductGrid filters={filters} onTotalChange={handleTotalChange} />
    </>
  )
}
