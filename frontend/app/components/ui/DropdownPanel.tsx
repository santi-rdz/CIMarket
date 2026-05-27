import { cn } from '@/app/lib/utils'

type DropdownPanelProps = React.ComponentPropsWithoutRef<'div'>

export default function DropdownPanel({ className, children, ...props }: DropdownPanelProps) {
  return (
    <div
      className={cn(
        'absolute z-50 rounded-2xl border overflow-hidden border-slate-200 bg-white p-2 text-slate-800 shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
