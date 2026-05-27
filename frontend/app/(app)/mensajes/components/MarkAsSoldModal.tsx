'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineCheckCircle, HiXMark, HiOutlineTag } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { useMarkAsSold } from '@/app/hooks/useTransactions'
import type { ConversationDetail } from '@/app/types/conversation'

interface Props {
  conversation: ConversationDetail
  currentUserId: string
  onClose: () => void
  onSuccess: () => void
}

export function MarkAsSoldModal({
  conversation,
  currentUserId,
  onClose,
  onSuccess,
}: Props) {
  const { product, buyer, seller } = conversation
  const otherUser = seller.id === currentUserId ? buyer : seller
  const [confirmed, setConfirmed] = useState(false)
  const markAsSold = useMarkAsSold()

  function handleConfirm() {
    markAsSold.mutate(
      {
        productId: product.id,
        buyerId: otherUser.id,
        conversationId: conversation.id,
      },
      {
        onSuccess: () => {
          setConfirmed(true)
          setTimeout(onSuccess, 1800)
        },
      },
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl animate-[modal-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="txt-4 font-bold text-slate-900">Marcar como vendido</p>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <HiXMark className="size-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-50">
              <HiOutlineCheckCircle className="size-9 text-green-700" />
            </div>
            <p className="txt-5 font-semibold text-slate-900 text-center">
              ¡Producto marcado como vendido!
            </p>
            <p className="txt-6 text-slate-500 text-center">
              Le notificamos a {otherUser.name} para que deje su reseña.
            </p>
          </div>
        ) : (
          <div className="px-5 pb-5 space-y-4">
            {/* Product */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="size-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-lg bg-slate-200 shrink-0">
                  <HiOutlineTag className="size-5 text-slate-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="txt-5 font-semibold text-slate-900 truncate">
                  {product.title}
                </p>
                <p className="txt-6 font-semibold text-green-700">
                  ${Number(product.price).toLocaleString('es-MX')}
                </p>
              </div>
            </div>

            {/* Buyer */}
            <div>
              <p className="txt-6 text-slate-500 mb-2">Comprador</p>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3">
                {otherUser.photoUrl ? (
                  <img
                    src={otherUser.photoUrl}
                    referrerPolicy="no-referrer"
                    alt={otherUser.name}
                    className="size-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 txt-6 font-bold text-white shrink-0">
                    {otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="txt-5 font-semibold text-slate-900">{otherUser.name}</p>
              </div>
            </div>

            <p className="txt-6 text-slate-500 leading-relaxed">
              Al confirmar, el producto se marcará como vendido y se le pedirá a{' '}
              <span className="font-semibold text-slate-700">{otherUser.name}</span> que
              deje una reseña.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 txt-5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={markAsSold.isPending}
                className={cn(
                  'flex-1 rounded-xl bg-green-800 py-2.5 txt-5 font-semibold text-white transition-all hover:brightness-110',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {markAsSold.isPending ? 'Guardando...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
