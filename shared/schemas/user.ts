import { z } from 'zod'
import { USER_ROLES, USER_STATUSES } from '../constants'
import { csvValuesSchema, optionalSearch, paginationSchema, requiredText } from './common'

export const userSchema = z.object({
  googleId: requiredText('Google ID requerido'),
  name: requiredText('El nombre es requerido'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Correo electrónico inválido').max(255, 'Máximo 255 caracteres')),
  photoUrl: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.url('URL de foto inválida').max(2048).nullish(),
    )
    .transform((value) => (typeof value === 'string' ? value.trim() : value)),
  rol: z.enum(USER_ROLES, { error: 'Rol inválido' }).optional(),
  status: z.enum(USER_STATUSES, { error: 'Estado inválido' }).optional(),
})

export type UserInput = z.infer<typeof userSchema>

export const validateUser = (input: unknown) => userSchema.safeParse(input)
export const validatePartialUser = (input: unknown) =>
  userSchema.partial().safeParse(input)

export const authUserSchema = z.object({
  id: z.uuid(),
  name: requiredText('El nombre es requerido'),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  photoUrl: z.string().nullable(),
  rol: z.enum(USER_ROLES),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const usersQuerySchema = paginationSchema.extend({
  search: optionalSearch(),
  status: csvValuesSchema(USER_STATUSES, 'Estado inválido'),
  rol: csvValuesSchema(USER_ROLES, 'Rol inválido'),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
})

export type UsersQuery = z.infer<typeof usersQuerySchema>
