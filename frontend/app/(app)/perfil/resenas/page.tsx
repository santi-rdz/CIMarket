'use client'

import { useMe } from '@/app/hooks/useMe'
import { useUserReviews } from '@/app/hooks/useProfile'
import { ReviewCard } from '@/app/components/ReviewCard'
import { HiStar } from 'react-icons/hi2'

export default function ResenasPage() {
  const { data: me } = useMe()
  const { data: reviews, isLoading } = useUserReviews(me?.id)

  if (isLoading) return <PageSkeleton />

  const avg =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0

  return (
    <div className="space-y-6 animate-fade-in-up animate-duration-400">
      <div className="flex items-center justify-between">
        <h1 className="txt-2 font-bold text-slate-900">Reseñas recibidas</h1>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <HiStar className="size-5 text-amber-400" />
            <span className="txt-3 font-bold text-slate-900">{avg.toFixed(1)}</span>
            <span className="txt-5 text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="txt-5 text-slate-400">Aún no tienes reseñas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-100" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl bg-slate-100" />
      ))}
    </div>
  )
}
