'use client'

import * as React from 'react'
import {
  HiChevronDown,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'
import type { AuthUser } from '@cm/shared/schemas/user'
import { Button } from './ui/button'
import { useLogout } from '@/app/hooks/useLogout'
import DropdownPanel from './ui/DropdownPanel'
import useClickOutside from '@/app/hooks/useClickOutside'
import NewProductModal from './NewProductModal'

type UserDropdownProps = {
  user: AuthUser & { initials: string }
}

const menuItems = [
  { label: 'Mi perfil', icon: HiOutlineUser, href: '/perfil/cuenta' },
  { label: 'Mis ventas', icon: HiOutlineShoppingBag, href: '/perfil/publicaciones' },
  { label: 'Favoritos', icon: HiOutlineHeart, href: '/perfil/favoritos' },
  { label: 'Preferencias', icon: HiOutlineCog, href: '/perfil/preferencias' },
]

export default function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const close = React.useCallback(() => setOpen(false), [])
  const rootRef = useClickOutside<HTMLDivElement>(
    close,
    true,
    '[role="dialog"], [role="listbox"], .fixed.z-50',
  )

  const logout = useLogout()

  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  return (
    <div ref={rootRef} className="relative border rounded-full border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full p-1 transition hover:bg-slate-100 focus:outline-none"
      >
        <Avatar initials={user.initials} photoUrl={user.photoUrl} />
        <HiChevronDown
          className={cn(
            'h-4 w-4 text-slate-500 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <DropdownPanel className="right-0 top-[calc(100%+0.5rem)] w-64">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <Avatar initials={user.initials} photoUrl={user.photoUrl} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-1 mb-1" />

          {/* Menu items */}
          <nav className="flex flex-col gap-0.5 mb-2">
            {menuItems.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Icon className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                {label}
              </Link>
            ))}
          </nav>
          <NewProductModal trigger={{ className: 'w-full mb-1' }} />

          <div className="h-px bg-slate-100 mx-1 my-1" />

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <HiOutlineLogout className="h-4.5 w-4.5 shrink-0" />
            Cerrar sesión
          </button>
        </DropdownPanel>
      )}
    </div>
  )
}

function Avatar({
  initials,
  photoUrl,
  size = 'md',
}: {
  initials: string
  photoUrl?: string | null
  size?: 'md' | 'lg'
}) {
  const sizeClass = size === 'md' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-full object-cover', sizeClass)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-green-700 font-bold text-white',
        sizeClass,
      )}
    >
      {initials}
    </span>
  )
}
