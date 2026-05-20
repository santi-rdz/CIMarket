import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { PRODUCT_CONDITIONS } from '@cm/shared/constants'
import { Button } from '@/app/components/ui/button'
import Input from '@/app/components/ui/Input'
import FieldError from '@/app/components/ui/FieldError'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/app/components/ui/select'
import { useCategories } from '@/app/hooks/useCategories'
import CampusSelect from '@/app/components/CampusSelect'
import type { ProductFormInput } from '@cm/shared/schemas/product'

const CONDITION_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  BUEN_ESTADO: 'Buen estado',
  DIGITAL: 'Digital',
}

type Props = {
  form: UseFormReturn<ProductFormInput>
  onSubmit: () => void
  isPending: boolean
  submitLabel?: string
}

export default function StepDetails({ form, onSubmit, isPending, submitLabel = 'Publicar artículo' }: Props) {
  const { control, register, formState: { errors, isValid } } = form
  const { data: categories = [] } = useCategories()

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-3">
        <div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                className="w-full"
                value={field.value ? String(field.value) : ''}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger placeholder="Categoría" />
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError error={errors.categoryId} />
        </div>

        <div>
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <Select className="w-full" value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger placeholder="Estado" />
                <SelectContent>
                  {PRODUCT_CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CONDITION_LABELS[c] ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError error={errors.condition} />
        </div>
      </div>

      <div className="w-full">
        <Controller
          control={control}
          name="campusIds"
          render={({ field }) => (
            <CampusSelect
              value={field.value.map(String)}
              onValueChange={(v) => field.onChange(v.map(Number))}
              className="w-full"
            />
          )}
        />
        <FieldError error={errors.campusIds?.root ?? errors.campusIds} />
      </div>

      <div className="w-full">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            $
          </span>
          <Input
            type="number"
            placeholder="0.00"
            {...register('price', { valueAsNumber: true })}
            hasError={!!errors.price}
            className="pl-8"
            min={0}
            step="0.01"
          />
        </div>
        <FieldError error={errors.price} />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!isValid || isPending}
        isLoading={isPending}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </>
  )
}
