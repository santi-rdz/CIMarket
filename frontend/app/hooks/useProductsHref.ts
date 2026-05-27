'use client'

import { useDefaultCampuses } from './useDefaultCampuses'
import { filtersToParams, DEFAULT_FILTERS } from '@/app/types/filters'

/** /productos href with the user's campus preferences. */
export function useProductsHref(): string {
  const defaults = useDefaultCampuses()
  if (defaults.length === 0) return '/productos'
  const qs = filtersToParams({ ...DEFAULT_FILTERS, campusIds: defaults }).toString()
  return `/productos?${qs}`
}
