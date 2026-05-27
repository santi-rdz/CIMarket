import { z } from 'zod'
import { optionalText } from './common'

export const createTransactionSchema = z.object({
  productId: z.uuid('ID de producto inválido'),
  buyerId: z.uuid('ID de comprador inválido'),
  conversationId: z.uuid('ID de conversación inválido').optional(),
})

export const transactionReviewSchema = z.object({
  rating: z.coerce
    .number({ error: 'rating debe ser un entero entre 1 y 5' })
    .int('rating debe ser un entero entre 1 y 5')
    .min(1, 'rating debe ser un entero entre 1 y 5')
    .max(5, 'rating debe ser un entero entre 1 y 5'),
  comment: optionalText({ max: 2000 }),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type TransactionReviewInput = z.infer<typeof transactionReviewSchema>
