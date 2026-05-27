'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserFavorites } from '@/app/hooks/useProfile'
import { useMe } from '@/app/hooks/useMe'
import ProductCard from '@/app/components/ProductCard'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { Button } from '@/app/components/ui/button'

export default function FavoritosPage() {
  const { data: me } = useMe()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUserFavorites(me?.id, page)

  if (isLoading) return <PageSkeleton />

  const products = data?.data ?? []

  return (
    <div className="space-y-6 animate-fade-in-up animate-duration-400">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Favoritos</h1>
        <span className="text-sm text-slate-400">{data?.total ?? 0} guardados</span>
      </div>

      {products.length === 0 ? (
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
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <p className="txt-5 text-slate-400">No tienes productos guardados aún.</p>
          <Button href="/productos" size="sm">
            Explorar productos
          </Button>
        </div>
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
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
              >
                <HiChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-500">
                {page} / {data?.totalPages}
              </span>
              <button
                type="button"
                disabled={page === data?.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
              >
                <HiChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-slate-100" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
