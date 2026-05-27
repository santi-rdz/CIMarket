import Link from 'next/link'
import { HiStar, HiOutlineTag } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import type { ProfileReview } from '@/app/types/profile'

export function ReviewCard({ review }: { review: ProfileReview }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      {/* Reviewer row */}
      <div className="flex items-center gap-3">
        {review.reviewer.photoUrl ? (
          <img
            src={review.reviewer.photoUrl}
            alt={review.reviewer.name}
            referrerPolicy="no-referrer"
            className="size-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 txt-5 font-bold text-slate-500">
            {review.reviewer.name[0]?.toUpperCase()}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="txt-5 font-semibold text-slate-900 truncate">{review.reviewer.name}</p>
            <time className="txt-6 text-slate-400 shrink-0">
              {new Date(review.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <div className="mt-0.5 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <HiStar
                key={n}
                className={cn(
                  'size-3.5',
                  n <= Math.round(Number(review.rating)) ? 'text-amber-400' : 'text-slate-200',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Product + comment */}
      {(review.product || review.comment) && (
        <div className="mt-3 ml-12 space-y-1.5">
          {review.product && (
            <Link
              href={`/productos/${review.product.slug}`}
              className="inline-flex items-center gap-1 txt-6 text-slate-400 hover:text-green-700 transition-colors"
            >
              <HiOutlineTag className="size-3 shrink-0" />
              <span className="truncate">{review.product.title}</span>
            </Link>
          )}
          {review.comment && (
            <p className="txt-5 text-slate-600">{review.comment}</p>
          )}
        </div>
      )}
    </div>
  )
}
