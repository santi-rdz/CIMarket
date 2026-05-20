'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserProducts } from '@/app/hooks/useProfile'
import { useMe } from '@/app/hooks/useMe'
import ProductCard from '@/app/components/ProductCard'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import NewProductModal from '@/app/components/NewProductModal'

export default function PublicacionesPage() {
  const { data: me } = useMe()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUserProducts(me?.id, page)

  if (isLoading) return <PageSkeleton />

  const products = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mis publicaciones</h1>
        <span className="text-sm text-slate-400">{data?.total ?? 0} productos</span>
      </div>

      {products.length === 0 ? (
        <EmptyState
          message="Aún no has publicado ningún producto."
          action={<NewProductModal trigger={{ size: 'sm' }} />}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/productos/${product.slug}`}>
                <ProductCard product={product} />
              </Link>
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

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      <p className="txt-5 text-slate-400">{message}</p>
      {action}
    </div>
  )
}

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
      <span className="text-sm text-slate-500">
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
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-100" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
