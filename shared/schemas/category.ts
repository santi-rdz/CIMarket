import { z } from 'zod'
import { requiredText } from './common'

export const categorySchema = z.object({
  name: requiredText('El nombre es requerido'),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const validateCategory = (input: unknown) => categorySchema.safeParse(input)
