'use client'

import dynamic from 'next/dynamic'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { HiAdjustmentsHorizontal } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import FilterPanel from './FilterPanel'
import FilterSidebar from './FilterSidebar'
import SortBy from './SortBy'
import ActiveFilterChips from './ActiveFilterChips'
import SearchBar from '@/app/components/SearchBar'
import type { ActiveFilters, SortOption } from '@/app/types/filters'
import { paramsToFilters, filtersToParams } from '@/app/types/filters'
import { useDefaultCampuses } from '@/app/hooks/useDefaultCampuses'

const SORT_OPTIONS = [
  { value: 'recent' as SortOption, label: 'Más recientes' },
  { value: 'price_asc' as SortOption, label: 'Menor precio' },
  { value: 'price_desc' as SortOption, label: 'Mayor precio' },
]

const DEFAULT_SORT: SortOption = 'recent'

const ProductGrid = dynamic(() => import('./ProductGrid'), { ssr: false })

export default function ProductGridWrapper() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters = paramsToFilters(searchParams)

  // Restore campus selection when landing on /productos without campusIds in URL.
  // Priority: cached user selection → profile/preference defaults (first visit only).
  const defaultCampuses = useDefaultCampuses()

  useEffect(() => {
    if (searchParams.has('campusIds')) return
    if (defaultCampuses.length === 0) return

    const current = paramsToFilters(searchParams)
    const qs = filtersToParams({ ...current, campusIds: defaultCampuses }).toString()
    router.replace(`${pathname}?${qs}`, { scroll: false })
  }, [defaultCampuses, searchParams, router, pathname])

  const [filterOpen, setFilterOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [total, setTotal] = useState<number | undefined>()

  const handleTotalChange = useCallback((n: number) => setTotal(n), [])

  function setFilters(next: ActiveFilters) {
    const qs = filtersToParams(next).toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  // Only count condition + price (categories are visible inline)
  const activeFilterCount = [
    filters.condition !== undefined,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
  ].filter(Boolean).length

  function handleSidebarChange(next: ActiveFilters) {
    setFilters({ ...next, search: filters.search, campusIds: filters.campusIds, sort: filters.sort })
  }

  return (
    <>
      {/* Mobile: slide-out filter panel */}
      <FilterPanel
        isOpen={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => setFilters({ ...next, search: filters.search, campusIds: filters.campusIds })}
      />

      {/* SearchBar — mobile only (desktop shows in Header) */}
      <div className="mb-3 md:hidden">
        <SearchBar />
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-6 min-h-[calc(100dvh-var(--header-h,57px)-32px)] transition-[grid-template-columns] duration-300',
          sidebarOpen ? 'lg:grid-cols-[260px_1fr]' : 'lg:grid-cols-1',
        )}
      >
        {/* Sidebar — desktop only */}
        <div
          className={cn(
            'hidden lg:block lg:self-start lg:sticky lg:top-[calc(var(--header-h,57px)+16px)] transition-all duration-300 overflow-hidden',
            sidebarOpen ? 'opacity-100' : 'lg:hidden',
          )}
        >
          <FilterSidebar
            filters={filters}
            onChange={handleSidebarChange}
            onCollapse={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0">
          {/* Toolbar */}
          <div className="mb-6 flex items-center gap-3 pt-3">
            {/* Filter button — mobile */}
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2 txt-5 font-medium transition-colors shrink-0 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1',
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

            {/* Show sidebar button — desktop, only when collapsed */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 txt-5 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:shadow-sm shrink-0"
              >
                <HiAdjustmentsHorizontal className="h-4 w-4" />
                Filtros
              </button>
            )}

            {/* Active chips — mobile only */}
            <div className="lg:hidden">
              <ActiveFilterChips
                filters={filters}
                onRemove={(next) => setFilters({ ...next, search: filters.search, campusIds: filters.campusIds })}
              />
            </div>

            <div className="flex-1" />

            {total !== undefined && (
              <span className="txt-6 text-slate-400 shrink-0 tabular-nums">
                {total} resultados
              </span>
            )}

            <SortBy options={SORT_OPTIONS} defaultValue={DEFAULT_SORT} />
          </div>

          <ProductGrid filters={filters} onTotalChange={handleTotalChange} />
        </div>
      </div>
    </>
  )
}
