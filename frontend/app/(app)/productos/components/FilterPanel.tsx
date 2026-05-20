'use client'

import { useState } from 'react'
import { HiXMark } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/button'
import PriceRangeSlider from '@/app/components/ui/PriceRangeSlider'
import { useCategories } from '@/app/hooks/useCategories'
import { useCampuses } from '@/app/hooks/useCampuses'
import type { ActiveFilters } from '@/app/types/filters'
import { DEFAULT_FILTERS } from '@/app/types/filters'

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITIONS = [
  { value: 'NUEVO', label: 'Nuevo' },
  { value: 'COMO_NUEVO', label: 'Como nuevo' },
  { value: 'BUEN_ESTADO', label: 'Buen estado' },
  { value: 'DIGITAL', label: 'Digital' },
]

const PRICE_MAX = 10_000

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 txt-6 font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </h3>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 txt-6 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1',
        active
          ? 'border-green-800 bg-green-800 text-white'
          : 'border-slate-200 text-slate-600 hover:border-slate-300',
      )}
    >
      {children}
    </button>
  )
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean
  filters: ActiveFilters
  onClose: () => void
  onApply: (filters: ActiveFilters) => void
}

export default function FilterPanel({ isOpen, filters, onClose, onApply }: Props) {
  if (!isOpen) return null

  return <FilterPanelInner filters={filters} onClose={onClose} onApply={onApply} />
}

function FilterPanelInner({ filters, onClose, onApply }: Omit<Props, 'isOpen'>) {
  const { data: categories = [] } = useCategories()
  const { data: campuses = [] } = useCampuses()
  const [draft, setDraft] = useState<ActiveFilters>(filters)

  function toggleCategory(id: number) {
    setDraft((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }))
  }

  function clearCategories() {
    setDraft((prev) => ({ ...prev, categoryIds: [] }))
  }

  function toggleCampus(id: number) {
    setDraft((prev) => ({
      ...prev,
      campusIds: prev.campusIds.includes(id)
        ? prev.campusIds.filter((c) => c !== id)
        : [...prev.campusIds, id],
    }))
  }

  function clearCampuses() {
    setDraft((prev) => ({ ...prev, campusIds: [] }))
  }

  function toggleCondition(value: string) {
    setDraft((prev) => ({
      ...prev,
      condition: prev.condition === value ? undefined : value,
    }))
  }

  function handleApply() {
    onApply(draft)
    onClose()
  }

  function handleClear() {
    const cleared = { ...DEFAULT_FILTERS, sort: filters.sort }
    setDraft(cleared)
    onApply(cleared)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed left-0 top-0 z-50 flex h-full w-[340px] flex-col bg-white shadow-2xl animate-[slide-in-left_250ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="txt-4 font-bold text-slate-900">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Campus */}
          <section className="px-6 py-5 border-t border-slate-100">
            <SectionTitle>Campus</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.campusIds.length === 0} onClick={clearCampuses}>
                Todos
              </Chip>
              {campuses.map((campus) => (
                <Chip
                  key={campus.id}
                  active={draft.campusIds.includes(campus.id)}
                  onClick={() => toggleCampus(campus.id)}
                >
                  {campus.name}
                </Chip>
              ))}
            </div>
          </section>

          {/* Categoría */}
          <section className="px-6 py-5 border-t border-slate-100">
            <SectionTitle>Categoría</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <Chip active={draft.categoryIds.length === 0} onClick={clearCategories}>
                Todos
              </Chip>
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  active={draft.categoryIds.includes(cat.id)}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </Chip>
              ))}
            </div>
          </section>

          {/* Condición */}
          <section className="px-6 py-5 border-t border-slate-100">
            <SectionTitle>Condición</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <Chip
                  key={c.value}
                  active={draft.condition === c.value}
                  onClick={() => toggleCondition(c.value)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </section>

          {/* Precio */}
          <section className="px-6 py-5 border-t border-slate-100">
            <SectionTitle>Precio</SectionTitle>

            <div className="mb-4 flex items-end gap-3">
              <div className="flex-1">
                <p className="mb-1.5 txt-6 text-slate-400">MÍNIMO</p>
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus-within:border-slate-400">
                  <span className="txt-5 text-slate-300">$</span>
                  <input
                    type="number"
                    min={0}
                    max={PRICE_MAX}
                    value={draft.minPrice ?? ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="0"
                    className="w-full bg-transparent txt-5 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <span className="mb-3 text-slate-200">—</span>

              <div className="flex-1">
                <p className="mb-1.5 txt-6 text-slate-400">MÁXIMO</p>
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus-within:border-slate-400">
                  <span className="txt-5 text-slate-300">$</span>
                  <input
                    type="number"
                    min={0}
                    max={PRICE_MAX}
                    value={draft.maxPrice ?? ''}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    placeholder="10,000"
                    className="w-full bg-transparent txt-5 text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <PriceRangeSlider
              minPrice={draft.minPrice ?? 0}
              maxPrice={draft.maxPrice ?? PRICE_MAX}
              onMinChange={(v) =>
                setDraft((prev) => ({ ...prev, minPrice: v === 0 ? undefined : v }))
              }
              onMaxChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  maxPrice: v === PRICE_MAX ? undefined : v,
                }))
              }
            />
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClear}
            className="txt-5 font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-900"
          >
            Limpiar todo
          </button>
          <Button variant="primary" size="md" onClick={handleApply}>
            Mostrar resultados
          </Button>
        </div>
      </div>
    </>
  )
}
