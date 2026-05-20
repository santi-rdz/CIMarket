import { cn } from '@/app/lib/utils'

type Props = { className?: string }

export default function Divider({ className }: Props) {
  return <hr className={cn('border-0 border-t border-slate-100', className)} />
}
