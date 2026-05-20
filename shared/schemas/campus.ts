import { z } from 'zod'

export const campusSchema = z.object({
  name: z.string().min(1).max(255),
})

export type CampusInput = z.infer<typeof campusSchema>

export const validateCampus = (input: unknown) => campusSchema.safeParse(input)
