import { HiCheck } from 'react-icons/hi'
import { cn } from '../../lib/utils'

type FeatureItemProps = {
  Icon?: React.ElementType
  description: string
  variant?: 'card' | 'list'
}

export default function FeatureItem({
  Icon = HiCheck,
  description,
  variant = 'list',
}: FeatureItemProps) {
  return (
    <li
      className={cn(
        'flex items-center',
        variant === 'list' && 'gap-3',
        variant === 'card' && 'flex-col flex-1 gap-2 py-1',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center backdrop-blur border border-white/10',
          variant === 'list' && 'bg-green-400/10 size-6 rounded-full',
          variant === 'card' && 'bg-green-400/10 p-2 rounded-xl',
        )}
      >
        <Icon
          className="text-green-400"
          size={variant === 'list' ? 12 : 24}
          strokeWidth={variant === 'list' ? 2 : 1.5}
        />
      </div>
      <span
        className={cn(
          'font-medium',
          variant === 'card'
            ? 'tracking-wider uppercase txt-6 text-white/60 font-bold'
            : 'txt-5 text-white/80',
        )}
      >
        {description}
      </span>
    </li>
  )
}
