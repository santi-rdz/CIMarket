import { z } from 'zod'

export const googleAuthSchema = z.object({
  idToken: z.string().trim().min(1, 'El token de Google es requerido'),
  campusId: z.coerce.number().int().positive().optional(),
})

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
