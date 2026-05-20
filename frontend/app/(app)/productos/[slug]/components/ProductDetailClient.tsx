'use client'

import Link from 'next/link'
import { HiChevronRight, HiOutlineEye, HiOutlineClock, HiOutlineHeart } from 'react-icons/hi2'
import { useProduct } from '@/app/hooks/useProduct'
import { useMe } from '@/app/hooks/useMe'
import { useProductsHref } from '@/app/hooks/useProductsHref'
import type { ProductDetail } from '@/app/types/product'
import { timeAgo } from '@/app/lib/utils'
import ImageGallery from './ImageGallery'
import ProductInfo from './ProductInfo'
import SellerCard from './SellerCard'
import Modal from '@/app/login/components/Modal'
import OwnerActions, { OwnerActionButtons } from './OwnerActions'
import RelatedProducts from './RelatedProducts'

export default function ProductDetailClient({ slug, initialProduct }: { slug: string; initialProduct?: ProductDetail }) {
  const { data: product, isLoading, error } = useProduct(slug, initialProduct)
  const { data: me } = useMe()
  const productsHref = useProductsHref()
  const isOwner = me?.id === product?.user.id

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1120px] px-6 py-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="animate-pulse">
            <div className="aspect-[4/3] rounded-2xl bg-slate-100" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="size-16 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-24 rounded-lg bg-slate-100" />
            <div className="h-6 w-3/4 rounded-lg bg-slate-100" />
            <div className="h-20 rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-[1120px] px-6 py-20 text-center">
        <p className="txt-4 text-slate-400">No se encontró el producto</p>
        <Link href={productsHref} className="mt-4 inline-block txt-5 font-semibold text-green-700 hover:underline">
          Volver a productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 txt-6 text-slate-400">
        <Link href={productsHref} className="transition-colors hover:text-slate-600">Productos</Link>
        <HiChevronRight className="size-3" />
        <Link href={productsHref} className="transition-colors hover:text-slate-600">{product.category.name}</Link>
        <HiChevronRight className="size-3" />
        <span className="text-slate-500 truncate max-w-48">{product.title}</span>
      </nav>

      {/* Main content — sticky sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left — Images */}
        <div>
          <ImageGallery images={product.images} title={product.title} productId={product.id} />

          {/* Stats — below images on desktop */}
          <div className="mt-6 flex items-center gap-6 txt-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <HiOutlineEye className="size-3.5" />
              {product._count.favorites * 8 + 116} vistas
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineClock className="size-3.5" />
              {timeAgo(product.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineHeart className="size-3.5" />
              {product._count.favorites} guardado{product._count.favorites !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Right — sticky info panel */}
        <div className="lg:self-start lg:sticky lg:top-[calc(var(--header-h,57px)+16px)]">
          {isOwner ? (
            <Modal>
              <div className="rounded-2xl border border-slate-100 p-6 shadow-sm">
                <ProductInfo product={product} isOwner ownerActions={<OwnerActionButtons />} />
                <hr className="my-5 border-slate-100" />
                <OwnerActions product={product} />
              </div>
            </Modal>
          ) : (
            <div className="rounded-2xl border border-slate-100 p-6 shadow-sm">
              <ProductInfo product={product} />
              <SellerCard seller={product.user} productId={product.id} />
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts
        categoryId={product.category.id}
        categoryName={product.category.name}
        excludeId={product.id}
      />
    </div>
  )
}
