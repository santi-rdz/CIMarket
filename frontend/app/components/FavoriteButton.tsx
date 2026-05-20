'use client'

import { HiHeart, HiOutlineHeart } from 'react-icons/hi'
import { cn } from '@/app/lib/utils'
import { useFavorite } from '@/app/hooks/useFavorite'

type Variant = 'card' | 'detail'

interface Props {
  productId: string
  variant?: Variant
  className?: string
}

export default function FavoriteButton({ productId, variant = 'card', className }: Props) {
  const { favorited, isPending, toggle, isLoggedIn } = useFavorite(productId)

  if (!isLoggedIn) return null

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); toggle() }}
        disabled={isPending}
        aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={cn(
          'flex size-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-160 disabled:opacity-50',
          className,
        )}
      >
        {favorited
          ? <HiHeart className="size-3.5 text-red-500" />
          : <HiOutlineHeart className="size-3 text-slate-900" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggle()}
      disabled={isPending}
      aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        'flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-50',
        favorited
          ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-slate-200 text-slate-500 hover:bg-slate-50',
        className,
      )}
    >
      {favorited
        ? <HiHeart className="size-[18px]" />
        : <HiOutlineHeart className="size-[18px]" />}
    </button>
  )
}
