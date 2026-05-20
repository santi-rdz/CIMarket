import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1).max(255),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const validateCategory = (input: unknown) => categorySchema.safeParse(input)
