'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  HiMagnifyingGlass,
  HiOutlineClock,
  HiXMark,
} from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { paramsToFilters, filtersToParams } from '@/app/types/filters'
import CampusSelect from './CampusSelect'
import { useDefaultCampuses } from '@/app/hooks/useDefaultCampuses'

// ─── Storage helpers ──────────────────────────────────────────────────────────

const RECENT_KEY = 'cm_recent_searches'
const MAX_RECENT = 5

function getRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecent(term: string) {
  if (!term.trim()) return
  const prev = getRecent().filter((t) => t !== term)
  const next = [term, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function removeRecent(term: string) {
  const next = getRecent().filter((t) => t !== term)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  return (
    <Suspense>
      <SearchBarInner compact={compact} />
    </Suspense>
  )
}

function SearchBarInner({ compact }: { compact: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = paramsToFilters(searchParams)
  const defaultCampuses = useDefaultCampuses()
  const [query, setQuery] = React.useState(filters.search ?? '')
  const [open, setOpen] = React.useState(false)
  const [recent, setRecent] = React.useState<string[]>([])
  const [campusIds, setCampusIds] = React.useState<number[]>(filters.campusIds)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Keep campus state in sync: prefer URL params, fall back to preferences
  React.useEffect(() => {
    if (filters.campusIds.length > 0) {
      setCampusIds(filters.campusIds)
    } else if (defaultCampuses.length > 0) {
      setCampusIds(defaultCampuses)
    }
  }, [searchParams, defaultCampuses])

  // Sync input when URL changes externally
  React.useEffect(() => {
    setQuery(filters.search ?? '')
  }, [filters.search])

  // Load recent searches when dropdown opens
  React.useEffect(() => {
    if (open) setRecent(getRecent())
  }, [open])

  // Close dropdown on outside click
  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const filtersRef = React.useRef(filters)
  filtersRef.current = filters

  const navigate = React.useCallback(
    (overrides: Partial<typeof filters>) => {
      const next = { ...filtersRef.current, ...overrides }
      const qs = filtersToParams(next).toString()
      const target = `/productos${qs ? `?${qs}` : ''}`
      if (pathname === '/productos') {
        router.replace(target, { scroll: false })
      } else {
        router.push(target)
      }
    },
    [pathname, router],
  )

  function handleCampusChange(value: string[]) {
    const ids = value.map(Number).filter(Boolean)
    setCampusIds(ids)
    navigate({ campusIds: ids })
  }

  function commit(term: string) {
    const trimmed = term.trim()
    if (trimmed) saveRecent(trimmed)
    navigate({ search: trimmed || undefined })
    setOpen(false)
  }

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate({ search: value.trim() || undefined })
    }, 350)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    commit(query)
  }

  function handleDeleteRecent(e: React.MouseEvent, term: string) {
    e.stopPropagation()
    removeRecent(term)
    setRecent(getRecent())
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const showSuggestions = open && recent.length > 0

  return (
    <div ref={containerRef} className="relative grow">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full border border-slate-200 bg-white transition-shadow focus-within:shadow-md focus-within:border-slate-300"
      >
        {/* Campus scope selector */}
        <div className={cn('border-r border-slate-200 shrink-0', compact ? 'py-0.5' : 'py-1')}>
          <CampusSelect
            value={campusIds.map(String)}
            onValueChange={handleCampusChange}
            variant="ghost"
            size="sm"
            rounded="full"
            triggerClassName="border-0 shadow-none px-4 txt-6 text-slate-500 font-medium max-w-[180px]"
          />
        </div>

        {/* Search input */}
        <div className="flex flex-1 items-center gap-2 px-3">
          <HiMagnifyingGlass className="h-4 w-4 text-slate-300 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Buscar productos..."
            className={cn(
              'w-full bg-transparent txt-5 text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-300',
              compact ? 'py-1' : 'py-2',
            )}
          />
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-[dropdown-in_150ms_ease-out]">
          <section className="px-2 pt-3 pb-3">
            <p className="px-2 mb-1.5 txt-6 font-semibold text-slate-400 uppercase tracking-wide">
              Recientes
            </p>
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(term)
                  commit(term)
                }}
                className="group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <HiOutlineClock className="size-4 shrink-0 text-slate-300" />
                  <span className="txt-5 text-slate-700 truncate">{term}</span>
                </span>
                <span
                  role="button"
                  tabIndex={-1}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleDeleteRecent(e, term)}
                  className="p-0.5 rounded-md text-slate-300 hover:text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <HiXMark className="size-3.5" />
                </span>
              </button>
            ))}
          </section>
        </div>
      )}
    </div>
  )
}
