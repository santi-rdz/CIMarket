'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { HiOutlineBell, HiOutlineChatBubbleBottomCenter } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import Logo from './Logo'
import SearchBar from './SearchBar'
import HeaderAuth from './HeaderAuth'
import NewProductModal from './NewProductModal'
import NotificationDropdown from './NotificationDropdown'
import { useNotifications } from '@/app/hooks/useNotifications'

function IconButton({
  compact,
  badge,
  children,
  href,
  onClick,
  'aria-label': ariaLabel,
}: {
  compact: boolean
  badge: number
  children: React.ReactNode
  href?: string
  onClick?: () => void
  'aria-label': string
}) {
  const classes = cn(
    'relative rounded-full text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1',
    compact ? 'p-1.5' : 'p-2.5',
  )

  const badgeEl = badge > 0 && (
    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-700 px-1 text-[9px] font-bold leading-none text-white">
      {badge > 99 ? '99+' : badge}
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {children}
        {badgeEl}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} className={classes}>
      {children}
      {badgeEl}
    </button>
  )
}

export default function Header() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [compact, setCompact] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Sync header height to CSS variable for dependent sticky elements
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const update = () => {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      {/* Invisible sentinel at top of page */}
      <div ref={sentinelRef} className="absolute top-0 h-1 w-full" />

      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 transition-all duration-300',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1440px] items-center gap-4 px-6 md:gap-6 transition-all duration-300',
            compact ? 'py-1.5' : 'py-3',
          )}
        >
          <Logo />

          {/* SearchBar — desktop only */}
          <div className="hidden md:block grow min-w-0">
            <SearchBar compact={compact} />
          </div>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Vender — desktop only (MobileNav handles mobile) */}
            <div className="hidden md:block">
              <NewProductModal trigger={{ size: 'sm', label: 'Vender' }} />
            </div>

            <IconButton compact={compact} badge={0} href="/mensajes" aria-label="Mensajes">
              <HiOutlineChatBubbleBottomCenter className={cn('transition-all duration-300', compact ? 'h-4 w-4' : 'h-5 w-5')} />
            </IconButton>

            {/* Notifications */}
            <div className="relative">
              <IconButton
                compact={compact}
                badge={unreadCount}
                aria-label="Notificaciones"
                onClick={() => setShowNotifs((v) => !v)}
              >
                <HiOutlineBell className={cn('transition-all duration-300', compact ? 'h-4 w-4' : 'h-5 w-5')} />
              </IconButton>
              {showNotifs && (
                <NotificationDropdown compact={compact} onClose={() => setShowNotifs(false)} />
              )}
            </div>

            <HeaderAuth />
          </div>
        </div>
      </header>
    </>
  )
}
