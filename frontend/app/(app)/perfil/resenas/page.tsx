'use client'

import { useUserReviews } from '@/app/hooks/useProfile'
import { useMe } from '@/app/hooks/useMe'
import { HiStar } from 'react-icons/hi'
import { cn } from '@/app/lib/utils'

export default function ResenasPage() {
  const { data: me } = useMe()
  const { data: reviews, isLoading } = useUserReviews(me?.id)

  if (isLoading) return <PageSkeleton />

  const avg =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reseñas recibidas</h1>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <HiStar className="h-5 w-5 text-amber-400" />
            <span className="text-lg font-bold text-slate-900">{avg.toFixed(1)}</span>
            <span className="text-sm text-slate-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {!reviews || reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-400">Aún no tienes reseñas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                {review.reviewer.photoUrl ? (
                  <img
                    src={review.reviewer.photoUrl}
                    alt={review.reviewer.name}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500">
                    {review.reviewer.name[0]?.toUpperCase()}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {review.reviewer.name}
                    </p>
                    <time className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <StarRating rating={Number(review.rating)} />
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mt-0.5 flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <HiStar
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200',
          )}
        />
      ))}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-100" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-slate-100" />
      ))}
    </div>
  )
}
