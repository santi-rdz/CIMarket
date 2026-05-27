'use client'

import { HiXMark } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { useCategories } from '@/app/hooks/useCategories'
import PriceRangeSlider from '@/app/components/ui/PriceRangeSlider'
import type { ActiveFilters } from '@/app/types/filters'

const CONDITIONS = [
  { value: 'NUEVO', label: 'Nuevo' },
  { value: 'COMO_NUEVO', label: 'Como nuevo' },
  { value: 'BUEN_ESTADO', label: 'Buen estado' },
  { value: 'DIGITAL', label: 'Digital' },
]

const PRICE_MAX = 10_000

interface Props {
  filters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  onCollapse: () => void
}

export default function FilterSidebar({ filters, onChange, onCollapse }: Props) {
  const { data: categories = [] } = useCategories()

  function toggleCategory(id: number) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id]
    onChange({ ...filters, categoryIds: next })
  }

  function toggleCondition(value: string) {
    onChange({
      ...filters,
      condition: filters.condition === value ? undefined : value,
    })
  }

  function setMinPrice(v: number | undefined) {
    onChange({ ...filters, minPrice: v })
  }

  function setMaxPrice(v: number | undefined) {
    onChange({ ...filters, maxPrice: v })
  }

  const hasActiveFilters =
    filters.categoryIds.length > 0 ||
    filters.condition !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0.5">
        <h2 className="txt-5 font-bold text-slate-900">Filtros</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  categoryIds: [],
                  condition: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                })
              }
              className="txt-6 font-medium text-slate-400 transition-colors hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categoría */}
      <section className="px-4 py-3">
        <p className="mb-2.5 txt-6 font-semibold text-slate-500">Categoría</p>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, categoryIds: [] })}
            className={cn(
              'rounded-lg px-3 py-1.5 txt-6 font-medium text-left transition-colors',
              filters.categoryIds.length === 0
                ? 'bg-green-50 text-green-800'
                : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const active = filters.categoryIds.includes(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 txt-6 font-medium text-left transition-colors',
                  active
                    ? 'bg-green-50 text-green-800'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </section>

      <hr className="mx-4 border-slate-100" />

      {/* Condición */}
      <section className="px-4 py-3">
        <p className="mb-2.5 txt-6 font-semibold text-slate-500">Condición</p>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => {
            const active = filters.condition === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCondition(c.value)}
                className={cn(
                  'rounded-full px-3 py-1 txt-6 font-medium transition-colors',
                  active
                    ? 'bg-green-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </section>

      <hr className="mx-4 border-slate-100" />

      {/* Precio */}
      <section className="px-4 py-3 pb-4">
        <p className="mb-2.5 txt-6 font-semibold text-slate-500">Precio</p>
        <div className="mb-3 flex items-center gap-2">
          <div className="input flex flex-1 items-center gap-1 rounded-lg px-2.5 py-2">
            <span className="txt-6 text-slate-400">$</span>
            <input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.minPrice ?? ''}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Mín"
              className="w-full bg-transparent txt-6 text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <span className="txt-6 text-slate-300">–</span>
          <div className="input flex flex-1 items-center gap-1 rounded-lg px-2.5 py-2">
            <span className="txt-6 text-slate-400">$</span>
            <input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.maxPrice ?? ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Máx"
              className="w-full bg-transparent txt-6 text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
        <PriceRangeSlider
          minPrice={filters.minPrice ?? 0}
          maxPrice={filters.maxPrice ?? PRICE_MAX}
          onMinChange={(v) => setMinPrice(v === 0 ? undefined : v)}
          onMaxChange={(v) => setMaxPrice(v === PRICE_MAX ? undefined : v)}
        />
      </section>
    </div>
  )
}
