'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiPlus,
  HiOutlineHeart,
  HiOutlineUser,
} from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import Modal from '@/app/login/components/Modal'
import { NewProductForm } from '@/app/(app)/productos/components/NewProductForm'

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="flex items-end justify-around px-2 pb-safe pt-2">
        <NavItem
          href="/productos"
          icon={HiOutlineHome}
          label="Inicio"
          active={pathname === '/productos'}
        />
        <NavItem
          href="/productos?focus=search"
          icon={HiOutlineMagnifyingGlass}
          label="Buscar"
          active={false}
        />

        {/* Vender — elevated center button */}
        <Modal>
          <Modal.Trigger opens="post-product-mobile">
            <button type="button" className="flex flex-col items-center gap-1 pb-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white shadow-lg shadow-green-700/25 transition-transform active:scale-95">
                <HiPlus className="h-6 w-6" />
              </span>
              <span className="txt-6 text-slate-400">Vender</span>
            </button>
          </Modal.Trigger>
          <Modal.Content width="lg" height="xl">
            <NewProductForm />
          </Modal.Content>
        </Modal>

        <NavItem
          href="/perfil/favoritos"
          icon={HiOutlineHeart}
          label="Guardados"
          active={pathname === '/perfil/favoritos'}
        />
        <NavItem
          href="/perfil/cuenta"
          icon={HiOutlineUser}
          label="Perfil"
          active={pathname.startsWith('/perfil')}
        />
      </div>
    </nav>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1 rounded-lg"
    >
      <Icon
        className={cn(
          'h-5 w-5 transition-colors',
          active ? 'text-green-700' : 'text-slate-400',
        )}
      />
      <span
        className={cn(
          'txt-6 font-medium transition-colors',
          active ? 'text-green-700' : 'text-slate-400',
        )}
      >
        {label}
      </span>
    </Link>
  )
}
