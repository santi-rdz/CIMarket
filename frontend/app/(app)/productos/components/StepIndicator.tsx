import { cn } from '@/app/lib/utils'

interface Props {
  current: number
  total: number
}

export default function StepIndicator({ current, total }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === current ? 'w-6 bg-slate-900' : 'w-4 bg-slate-300',
          )}
        />
      ))}
    </div>
  )
}
