'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineCheckCircle, HiXMark, HiOutlineTag, HiOutlineGlobeAlt } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { useMarkAsSold } from '@/app/hooks/useTransactions'
import { useUpdateProductStatus } from '@/app/hooks/useProductActions'
import { useConversations } from '@/app/hooks/useConversations'
import type { Product } from '@/app/types/product'

const EXTERNAL_ID = '__external__'

interface Props {
  product: Pick<Product, 'id' | 'title' | 'price' | 'images'>
  currentUserId: string
  onClose: () => void
}

export function SelectBuyerModal({ product, currentUserId, onClose }: Props) {
  const { data: conversations, isLoading } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const markAsSold = useMarkAsSold()
  const updateStatus = useUpdateProductStatus(product.id)

  const isPending = markAsSold.isPending || updateStatus.isPending

  const productConversations = (conversations ?? []).filter(
    (c) => c.product.id === product.id,
  )

  const selectedConv =
    selectedId && selectedId !== EXTERNAL_ID
      ? productConversations.find((c) => c.id === selectedId) ?? null
      : null

  const selectedBuyer =
    selectedConv
      ? selectedConv.sellerId === currentUserId
        ? selectedConv.buyer
        : selectedConv.seller
      : null

  function handleConfirm() {
    if (!selectedId) return

    if (selectedId === EXTERNAL_ID) {
      updateStatus.mutate('VENDIDO', {
        onSuccess: () => {
          setConfirmed(true)
          setTimeout(onClose, 1800)
        },
      })
      return
    }

    if (!selectedConv || !selectedBuyer) return
    markAsSold.mutate(
      { productId: product.id, buyerId: selectedBuyer.id, conversationId: selectedConv.id },
      {
        onSuccess: () => {
          setConfirmed(true)
          setTimeout(onClose, 1800)
        },
      },
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl animate-[modal-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="txt-4 font-bold text-slate-900">Marcar como vendido</p>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <HiXMark className="size-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-50">
              <HiOutlineCheckCircle className="size-9 text-green-700" />
            </div>
            <p className="txt-5 text-center font-semibold text-slate-900">
              ¡Producto marcado como vendido!
            </p>
            <p className="txt-6 text-center text-slate-500">
              {selectedBuyer
                ? `Le notificamos a ${selectedBuyer.name} para que deje su reseña.`
                : 'Tu publicación ha sido actualizada.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-5 pb-5">
            {/* Product preview */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                  <HiOutlineTag className="size-5 text-slate-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="txt-5 truncate font-semibold text-slate-900">{product.title}</p>
                <p className="txt-6 font-semibold text-green-700">
                  ${Number(product.price).toLocaleString('es-MX')}
                </p>
              </div>
            </div>

            {/* Buyer list */}
            <div>
              <p className="txt-6 mb-2 text-slate-500">¿Quién te compró este producto?</p>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {productConversations.length > 0 && (
                    <div className="max-h-52 space-y-1.5 overflow-y-auto">
                      {productConversations.map((conv) => {
                        const buyer =
                          conv.sellerId === currentUserId ? conv.buyer : conv.seller
                        const isSelected = conv.id === selectedId
                        return (
                          <button
                            key={conv.id}
                            type="button"
                            onClick={() => setSelectedId(conv.id)}
                            className={cn(
                              'flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-colors',
                              isSelected
                                ? 'border-green-700 bg-green-50'
                                : 'border-slate-200 hover:bg-slate-50',
                            )}
                          >
                            {buyer.photoUrl ? (
                              <img
                                src={buyer.photoUrl}
                                referrerPolicy="no-referrer"
                                alt={buyer.name}
                                className="size-9 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="txt-6 flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                                {buyer.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <p
                              className={cn(
                                'txt-5 font-semibold',
                                isSelected ? 'text-green-800' : 'text-slate-900',
                              )}
                            >
                              {buyer.name}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* External option */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(EXTERNAL_ID)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-colors',
                      selectedId === EXTERNAL_ID
                        ? 'border-green-700 bg-green-50'
                        : 'border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <div
                      className={cn(
                        'txt-6 flex size-9 shrink-0 items-center justify-center rounded-full',
                        selectedId === EXTERNAL_ID
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-400',
                      )}
                    >
                      <HiOutlineGlobeAlt className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'txt-5 font-semibold',
                          selectedId === EXTERNAL_ID ? 'text-green-800' : 'text-slate-900',
                        )}
                      >
                        Vendido fuera de CIMarket
                      </p>
                      <p className="txt-6 text-slate-400">Facebook, WhatsApp u otro</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="txt-5 flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId || isPending}
                className={cn(
                  'txt-5 flex-1 rounded-xl bg-green-800 py-2.5 font-semibold text-white transition-all hover:brightness-110',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {isPending ? 'Guardando...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
