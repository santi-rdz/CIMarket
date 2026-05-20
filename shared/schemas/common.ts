import { z } from 'zod'

/**
 * Transforma los issues de Zod en un array legible { field, message }
 */
export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : '_form',
    message: issue.message,
  }))
}

// Schema reutilizable para query params de paginación
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})
