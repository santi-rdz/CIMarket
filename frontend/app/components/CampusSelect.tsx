'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { useCampuses } from '@/app/hooks/useCampuses'
import { HiOutlineMapPin } from 'react-icons/hi2'
import {
  Select,
  SelectContext,
  SelectContent,
  SelectItem,
  SelectSearch,
  SelectTrigger,
} from '@/app/components/ui/select'

type Campus = { id: number; name: string }

type CampusSelectProps = {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'xl' | 'full'
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

function sortBySelected(campuses: Campus[], value: string[]) {
  return [...campuses].sort((a, b) => {
    const aSelected = value.includes(String(a.id))
    const bSelected = value.includes(String(b.id))
    if (aSelected === bSelected) return 0
    return aSelected ? -1 : 1
  })
}

// Null-rendering component that auto-closes and sorts
function AutoCloseAndSort({
  prevValue,
  campuses,
  value,
  onSort,
}: {
  prevValue: string[]
  campuses: Campus[]
  value: string[]
  onSort: (sorted: Campus[]) => void
}) {
  const ctx = useContext(SelectContext)

  // Close on value change
  useEffect(() => {
    if (ctx?.open && prevValue.length !== ctx.value.length) {
      ctx.close()
    }
  }, [ctx?.value.length, ctx?.open, prevValue.length, ctx])

  // Sort when opening
  useEffect(() => {
    if (ctx?.open) {
      onSort(sortBySelected(campuses, value))
    }
  }, [ctx?.open, campuses, value, onSort])

  return null
}

export default function CampusSelect({
  value,
  onValueChange,
  placeholder = 'Campus disponible',
  variant,
  size,
  rounded,
  className,
  triggerClassName,
  contentClassName,
}: CampusSelectProps) {
  const { data: campuses = [] } = useCampuses()
  const [sorted, setSorted] = useState<Campus[]>([])
  const prevValueRef = useRef(value)

  useEffect(() => {
    prevValueRef.current = value
  }, [value])

  const items = sorted.length > 0 ? sorted : campuses

  return (
    <Select
      multiple
      value={value}
      onValueChange={(v) => onValueChange(Array.isArray(v) ? v : [v])}
      className={className}
    >
      <SelectTrigger
        variant={variant}
        size={size}
        rounded={rounded}
        icon={HiOutlineMapPin}
        className={triggerClassName}
      >
        {value.length === 0 ? placeholder : undefined}
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        <AutoCloseAndSort
          prevValue={prevValueRef.current}
          campuses={campuses}
          value={value}
          onSort={setSorted}
        />
        <SelectSearch placeholder="Buscar campus..." />
        {items.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
