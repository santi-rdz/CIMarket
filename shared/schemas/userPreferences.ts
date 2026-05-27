import { z } from 'zod'
import { requiredText } from './common'

export const updateUserSchema = z.object({
  name: requiredText('El nombre es requerido'),
  campusId: z.number({ error: 'Selecciona un campus' }).int().positive(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  showContactInfo: z.boolean().optional(),
  campusIds: z
    .array(z.number({ error: 'ID de campus inválido' }).int().positive())
    .optional(),
})

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>

export const validateUpdateUser = (input: unknown) =>
  updateUserSchema.partial().safeParse(input)
export const validateUserPreferences = (input: unknown) =>
  userPreferencesSchema.safeParse(input)
