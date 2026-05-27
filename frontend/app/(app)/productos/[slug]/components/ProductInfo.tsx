'use client'

import { useState } from 'react'
import { HiOutlineShare, HiOutlineMapPin } from 'react-icons/hi2'
import { toast } from 'sonner'
import { formatPrice, cn } from '@/app/lib/utils'
import { PRODUCT_STATUS } from '@cm/shared/constants'
import type { ProductDetail } from '@/app/types/product'
import FavoriteButton from '@/app/components/FavoriteButton'

const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
}

const CONDITION_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  BUEN_ESTADO: 'Buen estado',
  DIGITAL: 'Digital',
}

interface Props {
  product: ProductDetail
  isOwner?: boolean
  ownerActions?: React.ReactNode
}

export default function ProductInfo({ product, isOwner, ownerActions }: Props) {
  const conditionLabel = CONDITION_LABELS[product.condition] ?? product.condition

  return (
    <div>
      {/* Price — hero element */}
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            'txt-2 font-bold tracking-tight',
            product.status === PRODUCT_STATUS.VENDIDO
              ? 'text-slate-400 line-through'
              : 'text-slate-900',
          )}
        >
          {formatPrice(product.price)}
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          {ownerActions}
          {!isOwner && <FavoriteButton productId={product.id} variant="detail" />}
          <button
            type="button"
            onClick={async () => {
              const url = window.location.href
              const isMobile = navigator.maxTouchPoints > 0
              if (isMobile && navigator.share) {
                try {
                  await navigator.share({
                    title: product.title,
                    text: `${product.title} — ${formatPrice(product.price)}`,
                    url,
                  })
                } catch {}
              } else {
                await navigator.clipboard.writeText(url)
                toast.success('Enlace copiado')
              }
            }}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
          >
            <HiOutlineShare className="size-4" />
          </button>
        </div>
      </div>

      {/* Title + status */}
      <div className="mt-2 flex items-start gap-2">
        <h1 className="txt-4 font-semibold text-slate-900 leading-snug line-clamp-2">
          {product.title}
        </h1>
        <span
          className={cn(
            'mt-0.5 shrink-0 rounded-md px-2 py-1 txt-6 font-medium',
            product.status === PRODUCT_STATUS.DISPONIBLE && 'bg-green-50 text-green-700',
            product.status === PRODUCT_STATUS.RESERVADO && 'bg-amber-50 text-amber-700',
            product.status === PRODUCT_STATUS.VENDIDO && 'bg-slate-100 text-slate-500',
          )}
        >
          {STATUS_LABELS[product.status] ?? product.status}
        </span>
      </div>

      {/* Description */}
      {product.description && <ExpandableText text={product.description} />}

      {/* Details */}
      <div className="mt-5 space-y-3">
        <DetailRow label="Categoría" value={product.category.name} />
        <DetailRow label="Condición" value={conditionLabel} />
      </div>

      {/* Entrega en campus */}
      {product.campuses.length > 0 && (
        <div className="mt-5">
          <p className="txt-6 font-medium text-slate-400 mb-2">Entrega disponible en</p>
          <div className="flex flex-wrap gap-1.5">
            {product.campuses.map((campus) => (
              <span
                key={campus.id}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 txt-6 font-medium text-slate-600"
              >
                <HiOutlineMapPin className="size-3 text-slate-400" />
                {campus.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const needsClamp = text.length > 200

  return (
    <div className="mt-3">
      <p
        className={`txt-5 leading-relaxed text-slate-500 ${!expanded && needsClamp ? 'line-clamp-4' : ''}`}
      >
        {text}
      </p>
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 txt-6 font-semibold text-slate-900 hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between txt-5">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700">{value}</dd>
    </div>
  )
}
