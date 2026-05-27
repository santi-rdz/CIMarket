import { z } from 'zod'
import { requiredText } from './common'

export const campusSchema = z.object({
  name: requiredText('El nombre es requerido'),
})

export type CampusInput = z.infer<typeof campusSchema>

export const validateCampus = (input: unknown) => campusSchema.safeParse(input)
