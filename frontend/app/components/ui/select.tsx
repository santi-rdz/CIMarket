'use client'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cva } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'
import { HiCheck, HiChevronDown, HiSearch } from 'react-icons/hi'
import Checkbox from './Checkbox'
import useClickOutside from '@/app/hooks/useClickOutside'

// ─── Types ───────────────────────────────────────────────────────────────────

type SelectContext = {
  open: boolean
  multiple: boolean
  value: string[]
  labels: React.ReactNode[]
  triggerId: string
  contentId: string
  search: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  setSearch: (value: string) => void
  toggle: () => void
  close: () => void
  choose: (value: string) => void
}

type SelectProps = {
  children: React.ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  multiple?: boolean
  onValueChange?: (value: string | string[]) => void
  className?: string
}

type SelectTriggerProps = React.ComponentPropsWithoutRef<'button'> & {
  placeholder?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  rounded?: 'xl' | 'full'
  icon?: React.ComponentType<{ className?: string }>
}

type SelectItemProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'value'> & {
  value: string
}

type SelectChild = React.ReactElement<{
  value?: string
  children?: React.ReactNode
}>

// ─── Context ─────────────────────────────────────────────────────────────────

export const SelectContext = React.createContext<SelectContext | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('Select components must be used inside <Select>')
  return context
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toArray(value?: string | string[]) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function normalize(value: React.ReactNode) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function findLabels(children: React.ReactNode, values: string[]) {
  const labels: React.ReactNode[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    const item = child as SelectChild

    if (
      item.type === SelectItem &&
      item.props.value &&
      values.includes(item.props.value)
    ) {
      labels.push(item.props.children)
    }

    if (item.props.children) {
      labels.push(...findLabels(item.props.children, values))
    }
  })

  return labels
}

// ─── CVA Variants ───────────────────────────────────────────────────────────

const triggerVariants = cva(
  'flex w-full items-center justify-between gap-3 text-slate-900 transition duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'input focus-visible:outline-1.5 focus-visible:outline-green-800 focus-visible:-outline-offset-1',
        outline:
          'border border-slate-200 bg-white hover:border-slate-300 focus-visible:outline-1.5 focus-visible:outline-green-800 focus-visible:-outline-offset-1',
        ghost: 'bg-transparent hover:bg-slate-50 focus:bg-slate-50',
      },
      size: {
        sm: 'px-3 py-2 txt-6',
        md: 'px-4 py-2.5 txt-5',
        lg: 'px-4 py-3.5 txt-5',
      },
      rounded: {
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'xl',
    },
  },
)

// ─── Components ──────────────────────────────────────────────────────────────

export function Select({
  children,
  value,
  defaultValue,
  multiple = false,
  onValueChange,
  className,
}: SelectProps) {
  const triggerId = React.useId()
  const contentId = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [innerValue, setInnerValue] = React.useState(toArray(defaultValue))

  const selected = value === undefined ? innerValue : toArray(value)
  const labels = findLabels(children, selected)

  const close = React.useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  const rootRef = useClickOutside<HTMLDivElement>(close, true, '[role="listbox"]')

  function toggle() {
    setOpen((current) => !current)
  }

  function choose(nextValue: string) {
    const next = multiple
      ? selected.includes(nextValue)
        ? selected.filter((item) => item !== nextValue)
        : [...selected, nextValue]
      : [nextValue]

    if (value === undefined) setInnerValue(next)
    onValueChange?.(multiple ? next : next[0])
    if (!multiple) close()
  }

  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  return (
    <SelectContext.Provider
      value={{
        open,
        multiple,
        value: selected,
        labels,
        triggerId,
        contentId,
        search,
        triggerRef,
        setSearch,
        toggle,
        close,
        choose,
      }}
    >
      <div ref={rootRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
  placeholder,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  rounded = 'xl',
  icon: Icon,
  ...props
}: SelectTriggerProps) {
  const { open, toggle, triggerId, contentId, labels, value, multiple, triggerRef } =
    useSelect()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (!event.defaultPrevented && !disabled) toggle()
  }

  const hasValue = value.length > 0
  let displayValue: React.ReactNode = children ?? placeholder

  if (hasValue) {
    displayValue =
      multiple && labels.length > 1
        ? `${labels[0]} +${labels.length - 1}`
        : (labels[0] ?? placeholder)
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      id={triggerId}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={contentId}
      data-state={open ? 'open' : 'closed'}
      disabled={disabled}
      onClick={handleClick}
      className={cn(triggerVariants({ variant, size, rounded }), className)}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-left leading-none',
          !hasValue && 'text-slate-400',
        )}
      >
        {displayValue}
      </span>
      <HiChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
          open && 'rotate-180',
        )}
      />
    </button>
  )
}

export function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'span'> & { placeholder?: string }) {
  const { labels, value, multiple } = useSelect()
  const hasValue = value.length > 0

  let content: React.ReactNode = children ?? placeholder

  if (hasValue) {
    content =
      multiple && labels.length > 1
        ? `${labels[0]} +${labels.length - 1}`
        : (labels[0] ?? placeholder)
  }

  return (
    <span
      className={cn('block truncate', !hasValue && 'text-slate-400', className)}
      {...props}
    >
      {content}
    </span>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const { open, contentId, triggerId, triggerRef } = useSelect()
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 })

  React.useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [open, triggerRef])

  if (!open) return null

  const childArray = React.Children.toArray(children)
  const search = childArray.filter(
    (c) => React.isValidElement(c) && c.type === SelectSearch,
  )
  const items = childArray.filter(
    (c) => !(React.isValidElement(c) && c.type === SelectSearch),
  )

  return ReactDOM.createPortal(
    <div
      id={contentId}
      role="listbox"
      aria-labelledby={triggerId}
      style={{ position: 'fixed', top: pos.top, left: pos.left, '--select-trigger-w': `${pos.width}px` } as React.CSSProperties}
      className={cn(
        'z-50 min-w-[var(--select-trigger-w)] rounded-2xl border overflow-hidden border-slate-200 bg-white p-2 text-slate-800 shadow-md animate-[dropdown-in_150ms_ease-out]',
        className,
      )}
      {...props}
    >
      {search}
      <div className="max-h-72 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
        {items}
      </div>
    </div>,
    document.body,
  )
}

export function SelectSearch({
  className,
  placeholder = 'Buscar...',
  ...props
}: Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'>) {
  const { search, setSearch } = useSelect()

  return (
    <div className="sticky top-0 z-10 bg-white pb-2">
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <HiSearch className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full text-sm leading-none text-slate-900 outline-none bg-transparent',
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}

export function SelectGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const { search } = useSelect()
  const query = normalize(search)

  const items = React.Children.toArray(children).filter((child) => {
    if (!query || !React.isValidElement(child)) return true
    return normalize((child as SelectChild).props.value).includes(query)
  })

  if (items.length === 0) return null

  return (
    <div className="py-1">
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="flex flex-col gap-1">{items}</div>
    </div>
  )
}

export function SelectItem({
  className,
  children,
  value,
  onClick,
  ...props
}: SelectItemProps) {
  const { value: selected, choose, multiple } = useSelect()
  const isSelected = selected.includes(value)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (!event.defaultPrevented) choose(value)
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-150 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none',
        isSelected ? 'bg-emerald-50 text-slate-950' : 'text-slate-700',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {multiple ? (
        <Checkbox checked={isSelected} />
      ) : (
        isSelected && <HiCheck className="h-4 w-4 shrink-0 text-emerald-600" />
      )}
    </button>
  )
}

export function SelectFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 border-t border-slate-100 pt-1">{children}</div>
}
