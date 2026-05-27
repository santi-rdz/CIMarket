import { ViewTransition } from 'react'
import { HiMapPin } from 'react-icons/hi2'
import { formatPrice } from '@/app/lib/utils'
import type { Product } from '@/app/types/product'
import FavoriteButton from './FavoriteButton'
import NoImagePlaceholder from './NoImagePlaceholder'

const CONDITION_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  BUEN_ESTADO: 'Buen estado',
  DIGITAL: 'Digital',
}

interface Props {
  product: Product
  isOwn?: boolean
}

export default function ProductCard({ product, isOwn }: Props) {
  const image = product.images[0]
  const campus = product.campuses[0]
  const conditionLabel = CONDITION_LABELS[product.condition] ?? product.condition

  return (
    <article className="group">
      {/* ── Image ── */}
      <ViewTransition name={`product-image-${product.id}`}>
        <figure className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {image ? (
            <>
              {/* Blurred background fill */}
              <img
                src={image.url}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover scale-105 blur-xl brightness-95"
              />
              {/* Sharp foreground */}
              <img
                src={image.url}
                alt={product.title}
                className="relative size-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </>
          ) : (
            <NoImagePlaceholder />
          )}

          {/* Sold overlay */}
          {product.status === 'VENDIDO' && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          )}

          {/* Condition badge */}
          <span className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 txt-6 font-medium leading-none text-white/80 backdrop-blur-md sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100">
            {conditionLabel}
          </span>

          {/* Sold badge */}
          {product.status === 'VENDIDO' && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/95 px-3 py-1.5 txt-6 font-bold text-slate-700 shadow-sm tracking-wide uppercase">
              Vendido
            </span>
          )}

          {/* Own badge */}
          {isOwn && (
            <span className="absolute left-2 top-2 rounded-lg bg-emerald-500/90 px-2 py-1 txt-6 font-medium leading-none text-white backdrop-blur-md">
              Mi publicación
            </span>
          )}

          {/* Favorite — visible on hover (not for own products) */}
          {!isOwn && product.status !== 'VENDIDO' && (
            <FavoriteButton
              productId={product.id}
              variant="card"
              className="absolute right-2.5 top-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
          )}
        </figure>
      </ViewTransition>

      {/* ── Info ── */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 txt-5 font-semibold text-slate-900">
            {product.title}
          </h3>
        </div>
        <p className="txt-base font-bold text-slate-900">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="txt-6 text-slate-400 truncate max-w-[45%]">
            {product.category.name}
          </span>
          {campus && (
            <span className="flex items-center gap-1 txt-6 text-slate-400 max-w-[50%]">
              <HiMapPin className="size-2.5 shrink-0" />
              <span className="truncate">{campus.name}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
