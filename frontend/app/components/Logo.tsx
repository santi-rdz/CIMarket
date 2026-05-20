'use client'

import Link from 'next/link'
import { useProductsHref } from '@/app/hooks/useProductsHref'

export default function Logo({ white = false }: { white?: boolean }) {
  const href = useProductsHref()
  return (
    <Link
      href={href}
      className={`txt-4 font-bold tracking-tight shrink-0 ${white ? 'text-white' : 'text-slate-900'}`}
    >
      CIMarket
    </Link>
  )
}
