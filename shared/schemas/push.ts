import { z } from 'zod'

export const pushSubscribeSchema = z.object({
  endpoint: z.string().trim().url().max(500),
  keys: z.object({
    p256dh: z.string().trim().min(1),
    auth: z.string().trim().min(1),
  }),
})

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().trim().url().max(500),
})
