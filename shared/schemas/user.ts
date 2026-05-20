import { z } from 'zod'
import { USER_ROLES, USER_STATUSES } from '../constants'
import { paginationSchema } from './common'

export const userSchema = z.object({
  googleId: z.string().max(255, 'Máximo 255 caracteres'),
  name: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  email: z.email('Correo electrónico inválido').max(255, 'Máximo 255 caracteres'),
  campusId: z.number({ error: 'Selecciona un campus' }).int().positive(),
  photoUrl: z.url('URL de foto inválida').max(2048).nullish(),
  rol: z.enum(USER_ROLES, { error: 'Rol inválido' }).optional(),
  status: z.enum(USER_STATUSES, { error: 'Estado inválido' }).optional(),
})

export type UserInput = z.infer<typeof userSchema>

export const validateUser = (input: unknown) => userSchema.safeParse(input)
export const validatePartialUser = (input: unknown) => userSchema.partial().safeParse(input)

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  rol: z.enum(USER_ROLES),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const usersQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  status: z.string().optional(),
  rol: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
})

export type UsersQuery = z.infer<typeof usersQuerySchema>
