'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HiStar, HiOutlineStar, HiXMark } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSubmitReview } from '@/app/hooks/useTransactions'
import type { Transaction } from '@/app/types/transaction'

const RATING_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

interface Props {
  transaction: Transaction
  currentUserId: string
  onClose: () => void
}

export function ReviewModal({ transaction, currentUserId, onClose }: Props) {
  const isBuyer  = transaction.buyer.id  === currentUserId
  const reviewee = isBuyer ? transaction.seller : transaction.buyer

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const submit = useSubmitReview()
  const router = useRouter()

  function handleSubmit() {
    if (rating === 0) return
    submit.mutate(
      { transactionId: transaction.id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          const profileUrl = `/usuarios/${reviewee.id}?tab=resenas`
          toast.success('¡Reseña publicada!', {
            description: `Le diste ${rating} ${rating === 1 ? 'estrella' : 'estrellas'} a ${reviewee.name}.`,
            action: {
              label: 'Ver reseña',
              onClick: () => router.push(profileUrl),
            },
          })
          onClose()
        },
      },
    )
  }

  const displayRating = hovered || rating

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl animate-[modal-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="txt-4 font-bold text-slate-900">Deja tu reseña</p>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <HiXMark className="size-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
            {/* Product context */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              {transaction.product.images?.[0]?.url ? (
                <img
                  src={transaction.product.images[0].url}
                  alt={transaction.product.title}
                  className="size-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="size-12 rounded-lg bg-slate-200 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="txt-6 text-slate-500">{isBuyer ? 'Compraste' : 'Vendiste'}</p>
                <p className="txt-5 font-semibold text-slate-900 truncate">
                  {transaction.product.title}
                </p>
              </div>
            </div>

            {/* Reviewee */}
            <div className="flex flex-col items-center gap-2 py-1">
              {reviewee.photoUrl ? (
                <img
                  src={reviewee.photoUrl}
                  referrerPolicy="no-referrer"
                  alt={reviewee.name}
                  className="size-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 txt-5 font-bold text-white">
                  {reviewee.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <p className="txt-5 font-semibold text-slate-900">{reviewee.name}</p>
              <p className="txt-6 text-slate-500">
                {isBuyer ? '¿Cómo fue tu experiencia con el vendedor?' : '¿Cómo fue el comprador?'}
              </p>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                  >
                    {star <= displayRating ? (
                      <HiStar className="size-9 text-amber-400" />
                    ) : (
                      <HiOutlineStar className="size-9 text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
              <p
                className={cn(
                  'txt-6 font-semibold transition-colors h-4',
                  displayRating > 0 ? 'text-amber-500' : 'text-transparent',
                )}
              >
                {RATING_LABELS[displayRating]}
              </p>
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más (opcional)..."
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 txt-5 text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline-1.5 focus-visible:outline-green-800 transition-colors"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 txt-5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Ahora no
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submit.isPending}
                className={cn(
                  'flex-1 rounded-xl bg-green-800 py-2.5 txt-5 font-semibold text-white transition-all hover:brightness-110',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                {submit.isPending ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </div>
          </div>
      </div>
    </div>,
    document.body,
  )
}
