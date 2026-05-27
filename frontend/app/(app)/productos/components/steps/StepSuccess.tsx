import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HiCheckCircle } from 'react-icons/hi'
import { Button } from '@/app/components/ui/button'

type Props = {
  productSlug: string | null
  onReset: () => void
  onClose?: () => void
}

export default function StepSuccess({ productSlug, onReset, onClose }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (!onClose) return
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  function handleViewProduct() {
    onClose?.()
    if (productSlug) router.push(`/productos/${productSlug}`)
  }

  return (
    <>
      <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-green-50">
        <HiCheckCircle className="size-8 text-green-600" />
      </div>
      <Button className="w-full" size="lg" onClick={handleViewProduct}>
        Ver mi publicación
      </Button>
      <Button className="w-full" size="lg" variant="outline" onClick={onReset}>
        Publicar otro artículo
      </Button>
    </>
  )
}
