'use client'

import { HiXMark } from 'react-icons/hi2'
import { useCategories } from '@/app/hooks/useCategories'
import { useCampuses } from '@/app/hooks/useCampuses'
import type { ActiveFilters } from '@/app/types/filters'
import { formatPrice } from '@/app/lib/utils'

const CONDITION_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  BUEN_ESTADO: 'Buen estado',
  DIGITAL: 'Digital',
}

interface Props {
  filters: ActiveFilters
  onRemove: (updated: ActiveFilters) => void
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 txt-6 font-medium text-green-800 transition-colors hover:border-green-300 hover:bg-green-100 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1"
    >
      {label}
      <HiXMark className="h-3 w-3 text-green-600" />
    </button>
  )
}

export default function ActiveFilterChips({ filters, onRemove }: Props) {
  const { data: categories = [] } = useCategories()
  const { data: campuses = [] } = useCampuses()

  const chips: { key: string; label: string; remove: () => void }[] = []

  // Campus chips
  if (filters.campusIds.length > 0) {
    const names = filters.campusIds
      .map((id) => campuses.find((c) => c.id === id)?.name)
      .filter(Boolean)
    if (names.length > 0) {
      chips.push({
        key: 'campus',
        label: names.length === 1 ? names[0]! : `${names.length} campus`,
        remove: () => onRemove({ ...filters, campusIds: [] }),
      })
    }
  }

  // Category chips
  for (const catId of filters.categoryIds) {
    const cat = categories.find((c) => c.id === catId)
    if (cat) {
      chips.push({
        key: `cat-${catId}`,
        label: cat.name,
        remove: () =>
          onRemove({ ...filters, categoryIds: filters.categoryIds.filter((id) => id !== catId) }),
      })
    }
  }

  // Condition chip
  if (filters.condition) {
    chips.push({
      key: 'condition',
      label: CONDITION_LABELS[filters.condition] ?? filters.condition,
      remove: () => onRemove({ ...filters, condition: undefined }),
    })
  }

  // Price chip
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice !== undefined ? formatPrice(filters.minPrice) : '$0'
    const max = filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : '∞'
    chips.push({
      key: 'price',
      label: `${min} — ${max}`,
      remove: () => onRemove({ ...filters, minPrice: undefined, maxPrice: undefined }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onRemove={chip.remove} />
      ))}
    </div>
  )
}
