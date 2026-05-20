import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductGridWrapper from './components/ProductGridWrapper'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explora artículos de segunda mano en venta por estudiantes de la UABC. Filtra por campus, categoría, precio y condición.',
}

export default function ProductsPage() {
  return (
    <Suspense>
      <div className="mx-auto max-w-[1440px] px-6">
        <ProductGridWrapper />
      </div>
    </Suspense>
  )
}
