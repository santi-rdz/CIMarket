'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HiArrowLeft } from 'react-icons/hi'
import { useCreateProduct } from '@/app/hooks/useCreateProduct'
import { useUpdateProduct } from '@/app/hooks/useProductActions'
import { useDefaultCampuses } from '@/app/hooks/useDefaultCampuses'
import { productFormSchema } from '@cm/shared/schemas/product'
import type { ProductFormInput } from '@cm/shared/schemas/product'
import type { ProductDetail } from '@/app/types/product'
import StepPhotos from './steps/StepPhotos'
import StepDetails from './steps/StepDetails'
import StepSuccess from './steps/StepSuccess'
import StepIndicator from './StepIndicator'

const STEP_FIELDS: (keyof ProductFormInput)[][] = [
  ['title', 'description'],
  ['categoryId', 'condition', 'campusIds', 'price'],
]

const CREATE_STEPS = [
  { title: 'Publica tu artículo', description: 'Fotos y descripción' },
  { title: 'Detalles del producto', description: 'Precio y categoría' },
  {
    title: '¡Producto publicado!',
    description: 'Tu artículo ya está visible para toda la comunidad UABC.',
  },
]

const EDIT_STEPS = [
  { title: 'Editar artículo', description: 'Fotos y descripción' },
  { title: 'Detalles del producto', description: 'Precio y categoría' },
]

interface Props {
  onCloseModal?: () => void
  product?: ProductDetail
}

export function NewProductForm({ onCloseModal, product }: Props) {
  const isEditMode = !!product
  const STEPS = isEditMode ? EDIT_STEPS : CREATE_STEPS
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])

  const existingUrls = isEditMode
    ? product.images
        .filter((img) => !removedImageIds.includes(img.id))
        .map((img) => img.url)
    : []

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormInput>,
    defaultValues: isEditMode
      ? {
          title: product.title,
          description: product.description,
          price: Number(product.price),
          condition: product.condition as ProductFormInput['condition'],
          categoryId: product.category.id,
          campusIds: product.campuses.map((c) => c.id),
        }
      : {
          title: '',
          description: '',
          categoryId: undefined,
          condition: undefined,
          campusIds: [],
          price: undefined,
        },
    mode: 'onTouched',
  })

  const { mutate: create, isPending: createPending } = useCreateProduct()
  const { mutate: update, isPending: updatePending } = useUpdateProduct(product?.id ?? '')
  const isPending = isEditMode ? updatePending : createPending

  const defaultCampuses = useDefaultCampuses()
  useEffect(() => {
    if (!isEditMode && defaultCampuses.length > 0) {
      form.setValue('campusIds', defaultCampuses, { shouldValidate: false })
    }
  }, [defaultCampuses, form, isEditMode])

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => s + 1)
  }

  function handleSubmit(data: ProductFormInput) {
    if (isEditMode) {
      update(data, {
        onSuccess: (updated) => {
          onCloseModal?.()
          if (updated.slug !== product.slug) {
            router.replace(`/productos/${updated.slug}`)
          }
        },
      })
    } else {
      create(
        {
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          categoryId: data.categoryId,
          campusIds: data.campusIds,
        },
        {
          onSuccess: (p) => {
            setCreatedSlug(p.slug)
            setStep(2)
          },
        },
      )
    }
  }

  function reset() {
    form.reset()
    setCreatedSlug(null)
    setRemovedImageIds([])
    setStep(0)
  }

  const { title, description } = STEPS[step]

  return (
    <div className="flex h-full w-full flex-col items-center">
      {step === 1 && (
        <button
          type="button"
          onClick={() => setStep(0)}
          className="absolute left-5 top-4 rounded-full bg-gray-50 p-2 transition-colors hover:bg-gray-100"
        >
          <HiArrowLeft className="size-4" />
        </button>
      )}

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
        <header className="mb-3 w-full space-y-1 text-center">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </header>

        {step === 0 && (
          <StepPhotos
            form={form}
            onNext={handleNext}
            existingUrls={isEditMode ? existingUrls : undefined}
            onRemoveExisting={
              isEditMode
                ? (i) => {
                    const img = product.images.filter(
                      (img) => !removedImageIds.includes(img.id),
                    )[i]
                    if (img) setRemovedImageIds((prev) => [...prev, img.id])
                  }
                : undefined
            }
          />
        )}

        {step === 1 && (
          <StepDetails
            form={form}
            onSubmit={form.handleSubmit(handleSubmit)}
            isPending={isPending}
            submitLabel={isEditMode ? 'Guardar cambios' : undefined}
          />
        )}

        {!isEditMode && step === 2 && (
          <StepSuccess productSlug={createdSlug} onReset={reset} onClose={onCloseModal} />
        )}
      </div>

      {step < 2 && <StepIndicator current={step} total={2} />}
    </div>
  )
}
