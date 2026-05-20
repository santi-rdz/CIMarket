'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineStar,
} from 'react-icons/hi'
import { cn } from '@/app/lib/utils'
import { useMe } from '@/app/hooks/useMe'
import { useUserProducts, useUserFavorites, useUserReviews } from '@/app/hooks/useProfile'

export default function ProfileSidebar({ variant = 'sidebar' }: { variant?: 'sidebar' | 'tabs' }) {
  const pathname = usePathname()
  const { data: me } = useMe()

  const { data: products } = useUserProducts(me?.id, 1)
  const { data: favorites } = useUserFavorites(me?.id, 1)
  const { data: reviews } = useUserReviews(me?.id)

  const counts: Record<string, number | undefined> = {
    '/perfil/publicaciones': products?.total ?? undefined,
    '/perfil/favoritos': favorites?.total ?? undefined,
    '/perfil/resenas': reviews?.length ?? undefined,
  }

  const NAV = [
    { label: 'Cuenta', href: '/perfil/cuenta', icon: HiOutlineUser },
    { label: 'Publicaciones', href: '/perfil/publicaciones', icon: HiOutlineShoppingBag },
    { label: 'Favoritos', href: '/perfil/favoritos', icon: HiOutlineHeart },
    { label: 'Reseñas', href: '/perfil/resenas', icon: HiOutlineStar },
    { label: 'Preferencias', href: '/perfil/preferencias', icon: HiOutlineCog },
  ]

  if (variant === 'tabs') {
    return (
      <nav className="flex gap-1 overflow-x-auto scrollbar-none border-b border-slate-100 pb-0">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          const count = counts[href]
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 txt-6 font-medium transition-colors',
                active
                  ? 'border-green-700 text-green-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  'txt-6 font-semibold tabular-nums',
                  active ? 'text-green-600' : 'text-slate-400',
                )}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        const count = counts[href]
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 txt-5 font-medium transition-colors',
              active
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1">{label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'txt-6 font-semibold tabular-nums',
                active ? 'text-slate-500' : 'text-slate-400',
              )}>
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
