'use client'

import { useDefaultCampuses } from './useDefaultCampuses'
import { filtersToParams, DEFAULT_FILTERS } from '@/app/types/filters'

/** /productos href with the user's saved campus defaults (profile + preferences). */
export function useProductsHref(): string {
  const campusIds = useDefaultCampuses()
  if (campusIds.length === 0) return '/productos'
  const qs = filtersToParams({ ...DEFAULT_FILTERS, campusIds }).toString()
  return `/productos?${qs}`
}
