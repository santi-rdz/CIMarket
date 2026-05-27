import { HiCheck } from 'react-icons/hi'
import { cn } from '@/app/lib/utils'

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

export default function Checkbox({
  checked = false,
  onChange,
  className,
}: CheckboxProps) {
  const Tag = onChange ? 'button' : 'span'

  return (
    <Tag
      {...(onChange
        ? { type: 'button' as const, onClick: () => onChange(!checked) }
        : {})}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
        checked ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white',
        className,
      )}
    >
      {checked && <HiCheck className="h-3.5 w-3.5 text-white" />}
    </Tag>
  )
}
