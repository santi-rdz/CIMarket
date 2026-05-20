export type SortOption = 'recent' | 'price_asc' | 'price_desc'

export type ActiveFilters = {
  search?: string
  categoryIds: number[]
  condition?: string
  campusIds: number[]
  minPrice?: number
  maxPrice?: number
  sort: SortOption
}

export const DEFAULT_FILTERS: ActiveFilters = {
  categoryIds: [],
  campusIds: [],
  sort: 'recent',
}

/** Serializa filtros a URLSearchParams */
export function filtersToParams(filters: ActiveFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.search) p.set('search', filters.search)
  if (filters.sort !== 'recent') p.set('sort', filters.sort)
  if (filters.categoryIds.length) p.set('categoryIds', filters.categoryIds.join(','))
  if (filters.condition) p.set('condition', filters.condition)
  if (filters.campusIds.length) p.set('campusIds', filters.campusIds.join(','))
  if (filters.minPrice !== undefined) p.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined) p.set('maxPrice', String(filters.maxPrice))
  return p
}

/** Lee filtros desde URLSearchParams */
export function paramsToFilters(p: URLSearchParams): ActiveFilters {
  return {
    search: p.get('search') || undefined,
    sort: (p.get('sort') as SortOption) || 'recent',
    categoryIds: p.get('categoryIds')?.split(',').map(Number).filter(Boolean) ?? [],
    condition: p.get('condition') || undefined,
    campusIds: p.get('campusIds')?.split(',').map(Number).filter(Boolean) ?? [],
    minPrice: p.has('minPrice') ? Number(p.get('minPrice')) : undefined,
    maxPrice: p.has('maxPrice') ? Number(p.get('maxPrice')) : undefined,
  }
}
