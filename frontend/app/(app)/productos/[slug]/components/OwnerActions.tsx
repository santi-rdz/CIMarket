'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2'
import { PRODUCT_STATUSES } from '@cm/shared/constants'
import { useUpdateProductStatus, useDeleteProduct } from '@/app/hooks/useProductActions'
import { useMe } from '@/app/hooks/useMe'
import { cn } from '@/app/lib/utils'
import Modal from '@/app/login/components/Modal'
import { Button } from '@/app/components/ui/button'
import { NewProductForm } from '@/app/(app)/productos/components/NewProductForm'
import { SelectBuyerModal } from './SelectBuyerModal'
import type { ProductDetail } from '@/app/types/product'

const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  VENDIDO: 'Vendido',
  RESERVADO: 'Reservado',
}

const STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-green-50 text-green-800 ring-green-700',
  VENDIDO: 'bg-slate-100 text-slate-500 ring-slate-400',
  RESERVADO: 'bg-amber-50 text-amber-700 ring-amber-500',
}

interface Props {
  product: ProductDetail
}

/** Top-right icon buttons for edit & delete (rendered via ownerActions slot in ProductInfo) */
export function OwnerActionButtons() {
  return (
    <>
      <Modal.Trigger opens="edit-product">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
        >
          <HiOutlinePencil className="size-4" />
        </button>
      </Modal.Trigger>
      <Modal.Trigger opens="delete-product">
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
        >
          <HiOutlineTrash className="size-4" />
        </button>
      </Modal.Trigger>
    </>
  )
}

export default function OwnerActions({ product }: Props) {
  const router = useRouter()
  const { data: me } = useMe()
  const { mutate: changeStatus, isPending: statusPending } = useUpdateProductStatus(
    product.id,
  )
  const { mutate: remove, isPending: deletePending } = useDeleteProduct(product.id)
  const [showSelectBuyer, setShowSelectBuyer] = useState(false)

  function handleStatusClick(status: string) {
    if (status === 'VENDIDO') {
      setShowSelectBuyer(true)
    } else {
      changeStatus(status)
    }
  }

  return (
    <>
      {/* Status chips */}
      <div className="flex gap-1.5">
        {PRODUCT_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            disabled={statusPending || status === product.status}
            onClick={() => handleStatusClick(status)}
            className={cn(
              'rounded-lg px-3 py-1.5 txt-6 font-medium transition-all',
              status === product.status
                ? `${STATUS_COLORS[status]} ring-1`
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600',
              'disabled:cursor-default',
            )}
          >
            {STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {showSelectBuyer && me && (
        <SelectBuyerModal
          product={product}
          currentUserId={me.id}
          onClose={() => setShowSelectBuyer(false)}
        />
      )}

      {/* Edit modal */}
      <Modal.Content name="edit-product" width="lg" height="xl">
        <NewProductForm product={product} />
      </Modal.Content>

      {/* Delete confirmation modal */}
      <Modal.Content name="delete-product" width="md" height="auto">
        <DeleteConfirm
          productTitle={product.title}
          isPending={deletePending}
          onConfirm={() =>
            remove(undefined, { onSuccess: () => router.push('/perfil/publicaciones') })
          }
        />
      </Modal.Content>
    </>
  )
}

function DeleteConfirm({
  productTitle,
  isPending,
  onConfirm,
  onCloseModal,
}: {
  productTitle: string
  isPending: boolean
  onConfirm: () => void
  onCloseModal?: () => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50">
          <HiOutlineTrash className="size-5 text-red-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="txt-3 font-bold text-slate-900">Eliminar producto</h2>
          <p className="txt-6 leading-relaxed text-slate-400">
            Se eliminará{' '}
            <span className="font-semibold text-slate-700">
              &quot;{productTitle}&quot;
            </span>{' '}
            del marketplace permanentemente.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCloseModal}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1 bg-red-600 text-white shadow-none hover:bg-red-700"
          isLoading={isPending}
          onClick={() => {
            onConfirm()
            onCloseModal?.()
          }}
        >
          Sí, eliminar
        </Button>
      </div>
    </div>
  )
}
