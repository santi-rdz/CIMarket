import Link from 'next/link'
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import { useProductsHref } from '@/app/hooks/useProductsHref'

export default function EmptyMessages() {
  const productsHref = useProductsHref()

  return (
    <div className="flex h-[calc(100dvh-var(--header-h,57px)-80px)] md:h-[calc(100dvh-var(--header-h,57px))] items-center justify-center px-6">
      <div className="text-center max-w-xs">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-slate-50">
          <HiOutlineChatBubbleLeftRight className="size-9 text-slate-300" />
        </div>
        <h2 className="txt-4 font-bold text-slate-900">Sin conversaciones</h2>
        <p className="mt-2 txt-5 text-slate-400 leading-relaxed">
          Cuando contactes a un vendedor desde un producto, tu conversación aparecerá aquí.
        </p>
        <Link href={productsHref} className="mt-5 inline-block txt-5 font-semibold text-green-700 hover:underline">
          Explorar productos
        </Link>
      </div>
    </div>
  )
}
