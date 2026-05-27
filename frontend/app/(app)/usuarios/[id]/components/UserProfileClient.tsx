'use client'

import { use, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HiOutlineTag } from 'react-icons/hi2'
import { HiStar, HiOutlineMapPin } from 'react-icons/hi2'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { useUserProfile, useUserProducts, useUserReviews } from '@/app/hooks/useProfile'
import ProductCard from '@/app/components/ProductCard'
import { ReviewCard } from '@/app/components/ReviewCard'
import { cn } from '@/app/lib/utils'

type Tab = 'publicaciones' | 'resenas'

export default function UserProfileClient({ id }: { id: string }) {
  const { data: profile, isLoading } = useUserProfile(id)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>(
    searchParams.get('tab') === 'resenas' ? 'resenas' : 'publicaciones',
  )

  useEffect(() => {
    if (searchParams.get('tab') === 'resenas') setActiveTab('resenas')
  }, [searchParams])

  if (isLoading) return <PageSkeleton />
  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="txt-3 text-slate-500">Usuario no encontrado</p>
        <Link
          href="/productos"
          className="mt-4 inline-block txt-5 font-semibold text-green-700 hover:underline"
        >
          Volver a productos
        </Link>
      </div>
    )
  }

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="flex items-start gap-5">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex size-20 items-center justify-center rounded-full bg-green-700 txt-2 font-bold text-white">
            {initials}
          </span>
        )}
        <div className="flex-1 space-y-1.5">
          <h1 className="txt-2 font-bold text-slate-900">{profile.name}</h1>
          {profile.campus && (
            <p className="flex items-center gap-1 txt-5 text-slate-400">
              <HiOutlineMapPin className="size-3.5" />
              {profile.campus.name}
            </p>
          )}
          <p className="txt-6 text-slate-400">Miembro desde {memberSince}</p>
        </div>
        <RatingBadge
          average={profile.rating?.average ?? 0}
          count={profile.rating?.count ?? 0}
        />
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6">
        <Stat label="Publicaciones" value={profile._count?.products ?? 0} />
        <Stat label="Reseñas" value={profile._count?.sellerReviews ?? 0} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-slate-100">
        <TabButton
          active={activeTab === 'publicaciones'}
          onClick={() => setActiveTab('publicaciones')}
        >
          Publicaciones
        </TabButton>
        <TabButton
          active={activeTab === 'resenas'}
          onClick={() => setActiveTab('resenas')}
        >
          Reseñas
        </TabButton>
      </div>

      <div className="mt-6">
        {activeTab === 'publicaciones' ? (
          <ProductsTab userId={id} />
        ) : (
          <ReviewsTab userId={id} />
        )}
      </div>
    </div>
  )
}

function RatingBadge({ average, count }: { average: number; count: number }) {
  if (count === 0) return null
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-slate-100 px-4 py-2">
      <div className="flex items-center gap-1">
        <HiStar className="size-5 text-amber-400" />
        <span className="txt-3 font-bold text-slate-900">{average.toFixed(1)}</span>
      </div>
      <span className="txt-6 text-slate-400">
        {count} reseña{count !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="txt-3 font-bold text-slate-900">{value}</p>
      <p className="txt-6 text-slate-400">{label}</p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 txt-5 font-medium transition-colors',
        active
          ? 'border-b-2 border-green-700 text-slate-900'
          : 'text-slate-400 hover:text-slate-600',
      )}
    >
      {children}
    </button>
  )
}

function ProductsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUserProducts(userId, page)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-100" />
        ))}
      </div>
    )
  }

  const products = data?.data ?? []

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
        <p className="txt-5 text-slate-400">Este usuario no tiene publicaciones.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/productos/${product.slug}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
      {(data?.totalPages ?? 1) > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
          >
            <HiChevronLeft className="size-4" />
          </button>
          <span className="txt-5 text-slate-500">
            {page} / {data?.totalPages}
          </span>
          <button
            type="button"
            disabled={page === data?.totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-full p-2 hover:bg-slate-100 disabled:opacity-30"
          >
            <HiChevronRight className="size-4" />
          </button>
        </div>
      )}
    </>
  )
}

function ReviewsTab({ userId }: { userId: string }) {
  const { data: reviews, isLoading } = useUserReviews(userId)

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
        <p className="txt-5 text-slate-400">Este usuario no tiene reseñas aún.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="size-20 rounded-full bg-slate-200" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-48 rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}
