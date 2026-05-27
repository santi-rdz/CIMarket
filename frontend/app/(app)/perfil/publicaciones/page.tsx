'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { HiChevronLeft, HiChevronRight, HiEllipsisVertical } from 'react-icons/hi2'
import { useUserProducts } from '@/app/hooks/useProfile'
import { useMe } from '@/app/hooks/useMe'
import { useUpdateProductStatus, useDeleteProduct } from '@/app/hooks/useProductActions'
import ProductCard from '@/app/components/ProductCard'
import NewProductModal from '@/app/components/NewProductModal'
import DropdownPanel from '@/app/components/ui/DropdownPanel'
import useClickOutside from '@/app/hooks/useClickOutside'
import { SelectBuyerModal } from '@/app/(app)/productos/[slug]/components/SelectBuyerModal'
import { cn } from '@/app/lib/utils'
import type { Product } from '@/app/types/product'

const TABS = [
  { label: 'Todas', value: undefined },
  { label: 'Activas', value: 'DISPONIBLE' },
  { label: 'Reservadas', value: 'RESERVADO' },
  { label: 'Vendidas', value: 'VENDIDO' },
]

export default function PublicacionesPage() {
  const { data: me } = useMe()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const { data, isLoading } = useUserProducts(me?.id, page, status)

  function handleTabChange(value: string | undefined) {
    setStatus(value)
    setPage(1)
  }

  if (isLoading) return <PageSkeleton />

  const products = data?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in-up animate-duration-400">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mis publicaciones</h1>
        <span className="txt-6 text-slate-400">{data?.total ?? 0} productos</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'rounded-full px-4 py-1.5 txt-6 font-medium transition-colors',
              status === tab.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          status={status}
          action={!status ? <NewProductModal trigger={{ size: 'sm' }} /> : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <PublicacionCard
                key={product.id}
                product={product}
                currentUserId={me?.id ?? ''}
              />
            ))}
          </div>
          {(data?.totalPages ?? 1) > 1 && (
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
          )}
        </>
      )}
    </div>
  )
}

// ─── Card with actions menu ────────────────────────────────────────────────────

function PublicacionCard({
  product,
  currentUserId,
}: {
  product: Product
  currentUserId: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const close = useCallback(() => { setMenuOpen(false); setDeleteConfirm(false) }, [])
  const menuRef = useClickOutside<HTMLDivElement>(close)
  const { mutate: changeStatus } = useUpdateProductStatus(product.id)
  const { mutate: remove, isPending: deleting } = useDeleteProduct(product.id)

  const isVendido = product.status === 'VENDIDO'
  const isReservado = product.status === 'RESERVADO'

  function handleMenuAction(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen((v) => !v)
    setDeleteConfirm(false)
  }

  return (
    <>
      <div className="relative">
        <Link href={`/productos/${product.slug}`}>
          <ProductCard product={product} />
        </Link>

        {/* 3-dots button — positioned over top-right of the image */}
        <div ref={menuRef} className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={handleMenuAction}
            className="flex size-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
          >
            <HiEllipsisVertical className="size-4" />
          </button>

          {menuOpen && (
            <DropdownPanel className="right-0 top-9 w-52">
              {deleteConfirm ? (
                <div className="p-1 space-y-2">
                  <p className="txt-6 text-slate-500 px-2 pt-1">
                    ¿Eliminar esta publicación?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(false)
                      }}
                      className="flex-1 rounded-xl border border-slate-200 py-2 txt-6 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(undefined, { onSuccess: close })
                      }}
                      disabled={deleting}
                      className="flex-1 rounded-xl bg-red-600 py-2 txt-6 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-1 space-y-0.5">
                  <MenuLink href={`/productos/${product.slug}`} onClick={close}>
                    Ver publicación
                  </MenuLink>

                  {!isVendido && (
                    <MenuButton
                      onClick={(e) => {
                        e.stopPropagation()
                        close()
                        setShowSellModal(true)
                      }}
                    >
                      Marcar como vendido
                    </MenuButton>
                  )}

                  {(isVendido || isReservado) && (
                    <MenuButton
                      onClick={(e) => {
                        e.stopPropagation()
                        close()
                        changeStatus('DISPONIBLE')
                      }}
                    >
                      Marcar como disponible
                    </MenuButton>
                  )}

                  {!isReservado && !isVendido && (
                    <MenuButton
                      onClick={(e) => {
                        e.stopPropagation()
                        close()
                        changeStatus('RESERVADO')
                      }}
                    >
                      Marcar como reservado
                    </MenuButton>
                  )}

                  <div className="h-px bg-slate-100 mx-1 my-1" />

                  <MenuButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(true)
                    }}
                    danger
                  >
                    Eliminar publicación
                  </MenuButton>
                </div>
              )}
            </DropdownPanel>
          )}
        </div>
      </div>

      {showSellModal && (
        <SelectBuyerModal
          product={product}
          currentUserId={currentUserId}
          onClose={() => setShowSellModal(false)}
        />
      )}
    </>
  )
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex w-full items-center rounded-xl px-3 py-2.5 txt-5 font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      {children}
    </Link>
  )
}

function MenuButton({
  onClick,
  danger,
  children,
}: {
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-xl px-3 py-2.5 txt-5 font-medium transition-colors text-left',
        danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

const EMPTY_MESSAGES: Record<string, string> = {
  DISPONIBLE: 'No tienes publicaciones activas.',
  VENDIDO: 'Aún no has vendido ningún producto.',
  RESERVADO: 'No tienes publicaciones reservadas.',
}

function EmptyState({
  status,
  action,
}: {
  status?: string
  action?: React.ReactNode
}) {
  const message = status
    ? (EMPTY_MESSAGES[status] ?? 'No hay publicaciones.')
    : 'Aún no has publicado ningún producto.'

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      <p className="txt-5 text-slate-400">{message}</p>
      {action}
    </div>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
      >
        <HiChevronLeft className="h-4 w-4" />
      </button>
      <span className="txt-6 text-slate-500">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
      >
        <HiChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-slate-100" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
