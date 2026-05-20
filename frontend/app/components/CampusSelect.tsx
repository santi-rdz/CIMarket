'use client'

import { useCampuses } from '@/app/hooks/useCampuses'
import { HiOutlineMapPin } from 'react-icons/hi2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSearch,
  SelectTrigger,
} from '@/app/components/ui/select'

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
        <SelectSearch placeholder="Buscar campus..." />
        {campuses.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
