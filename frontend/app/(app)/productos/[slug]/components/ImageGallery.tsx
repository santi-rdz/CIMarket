'use client'

import { useState } from 'react'
import { ViewTransition } from 'react'
import { cn } from '@/app/lib/utils'
import type { ProductImage } from '@/app/types/product'
import NoImagePlaceholder from '@/app/components/NoImagePlaceholder'

interface Props {
  images: ProductImage[]
  title: string
  productId: string
}

export default function ImageGallery({ images, title, productId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <ViewTransition name={`product-image-${productId}`}>
        <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100">
          <NoImagePlaceholder />
        </div>
      </ViewTransition>
    )
  }

  return (
    <div>
      {/* Main image */}
      <ViewTransition name={`product-image-${productId}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
          {/* Blurred background fill */}
          <img
            src={images[activeIndex].url}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover scale-105 blur-xl brightness-95"
          />
          {/* Sharp foreground */}
          <img
            src={images[activeIndex].url}
            alt={`${title} - Imagen ${activeIndex + 1}`}
            className="relative size-full object-contain"
          />

          {/* Dot indicators for mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'size-1.5 rounded-full transition-all',
                    i === activeIndex ? 'bg-white w-4' : 'bg-white/50',
                  )}
                  aria-label={`Ver imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </ViewTransition>

      {/* Thumbnails — desktop */}
      {images.length > 1 && (
        <div className="mt-3 hidden gap-2 lg:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'size-[72px] shrink-0 overflow-hidden rounded-xl transition-all',
                i === activeIndex
                  ? 'ring-2 ring-green-800 ring-offset-2'
                  : 'opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={img.url}
                alt={`${title} - Miniatura ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
