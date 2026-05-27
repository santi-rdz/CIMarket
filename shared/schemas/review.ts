import { z } from 'zod'
import { optionalText, paginationSchema } from './common'

export const reviewSchema = z.object({
  rating: z.coerce
    .number({ error: 'La calificación es requerida' })
    .min(0.5, 'Mínimo 0.5')
    .max(5, 'Máximo 5')
    .multipleOf(0.5, 'Debe ser múltiplo de 0.5'),
  comment: optionalText({ max: 2000, emptyAs: 'null' }),
  sellerId: z.uuid('ID de vendedor inválido'),
  reviewerId: z.uuid('ID de reseñador inválido'),
})

export type ReviewInput = z.infer<typeof reviewSchema>

export const validateReview = (input: unknown) => reviewSchema.safeParse(input)
export const validatePartialReview = (input: unknown) =>
  reviewSchema.pick({ rating: true, comment: true }).partial().safeParse(input)

export const reviewsQuerySchema = paginationSchema.extend({
  sellerId: z.uuid().optional(),
  reviewerId: z.uuid().optional(),
})

export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>
