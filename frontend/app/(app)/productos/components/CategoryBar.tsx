'use client'

import { useRef } from 'react'
import { cn } from '@/app/lib/utils'
import { useCategories } from '@/app/hooks/useCategories'

interface Props {
  selectedIds: number[]
  onToggle: (id: number) => void
}

export default function CategoryBar({ selectedIds, onToggle }: Props) {
  const { data: categories = [] } = useCategories()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (categories.length === 0) return null

  return (
    <div className="relative border-b border-slate-100">
      <div
        ref={scrollRef}
        className="flex items-end gap-1 overflow-x-auto scrollbar-none"
      >
        {/* "Todos" tab */}
        <button
          type="button"
          onClick={() => {
            // Deselect all when "Todos" is clicked
            for (const id of selectedIds) onToggle(id)
          }}
          className={cn(
            'relative shrink-0 px-4 pb-3 pt-2 txt-6 font-medium transition-colors',
            selectedIds.length === 0
              ? 'text-slate-900'
              : 'text-slate-400 hover:text-slate-600',
          )}
        >
          Todos
          {selectedIds.length === 0 && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-slate-900" />
          )}
        </button>

        {categories.map((cat) => {
          const active = selectedIds.includes(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggle(cat.id)}
              className={cn(
                'relative shrink-0 px-4 pb-3 pt-2 txt-6 font-medium whitespace-nowrap transition-colors',
                active
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              {cat.name}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
