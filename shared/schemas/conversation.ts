import { z } from 'zod'
import { optionalText, requiredText } from './common'

export const createConversationSchema = z.object({
  sellerId: z.uuid('ID de vendedor inválido'),
  productId: z.uuid('ID de producto inválido'),
})

export const sendMessageSchema = z.object({
  content: requiredText('El mensaje no puede estar vacío', { max: 5000 }),
  replyToId: z.uuid('ID de mensaje inválido').optional(),
})

export const reportReasonSchema = z.enum([
  'SPAM',
  'ACOSO',
  'FRAUDE',
  'CONTENIDO_INAPROPIADO',
  'OTRO',
])

export const reportConversationSchema = z.object({
  reason: reportReasonSchema,
  detail: optionalText({ max: 2000 }),
})

export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ReportConversationInput = z.infer<typeof reportConversationSchema>
