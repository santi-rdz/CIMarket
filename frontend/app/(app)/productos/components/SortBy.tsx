'use client'

import { useContext } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HiArrowsUpDown, HiXMark } from 'react-icons/hi2'
import {
  Select,
  SelectContent,
  SelectContext,
  SelectFooter,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SortByOption<T extends string = string> = { value: T; label: string }

interface Props<T extends string = string> {
  options: SortByOption<T>[]
  defaultValue: T
  paramKey?: string
  placeholder?: string
}

// ─── ClearButton ─────────────────────────────────────────────────────────────

function ClearButton({ onClear }: { onClear: () => void }) {
  const ctx = useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => {
        onClear()
        ctx?.close()
      }}
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
    >
      <HiXMark className="h-4 w-4" />
      Limpiar ordenamiento
    </button>
  )
}

// ─── SortBy ──────────────────────────────────────────────────────────────────

export default function SortBy<T extends string = string>({
  options,
  defaultValue,
  paramKey = 'sort',
  placeholder = 'Ordenar por',
}: Props<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = (searchParams.get(paramKey) ?? defaultValue) as T

  function setSort(value: T | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== defaultValue) {
      params.set(paramKey, value)
    } else {
      params.delete(paramKey)
    }
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <Select value={current} onValueChange={(v) => setSort(v as T)}>
      <SelectTrigger icon={HiArrowsUpDown} variant="outline" rounded="full" size="sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-56">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
        <SelectFooter>
          <ClearButton onClear={() => setSort(null)} />
        </SelectFooter>
      </SelectContent>
    </Select>
  )
}
