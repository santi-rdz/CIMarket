import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/app/components/ui/button'
import Input from '@/app/components/ui/Input'
import FieldError from '@/app/components/ui/FieldError'
import type { ProductFormInput } from '@cm/shared/schemas/product'
import ImageUpload from '../ImageUpload'

type Props = {
  form: UseFormReturn<ProductFormInput>
  onNext: () => void
  existingUrls?: string[]
  onRemoveExisting?: (index: number) => void
}

export default function StepPhotos({
  form,
  onNext,
  existingUrls,
  onRemoveExisting,
}: Props) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <>
      <ImageUpload
        files={[]}
        onChange={() => {}}
        existingUrls={existingUrls}
        onRemoveExisting={onRemoveExisting}
      />

      <div className="w-full">
        <Input
          placeholder="Título del producto"
          {...register('title')}
          hasError={!!errors.title}
        />
        <FieldError error={errors.title} />
      </div>

      <div className="w-full">
        <Input
          as="textarea"
          placeholder="Descripción del producto..."
          {...register('description')}
          hasError={!!errors.description}
          className="min-h-24 resize-none"
        />
        <FieldError error={errors.description} />
      </div>

      <Button className="w-full" size="lg" onClick={onNext}>
        Continuar
      </Button>
    </>
  )
}
