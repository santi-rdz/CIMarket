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

export function requiredText(message: string, options: { max?: number } = {}) {
  const max = options.max ?? 255
  return z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`)
}

export function optionalText(
  options: { max?: number; emptyAs?: 'undefined' | 'null' } = {},
) {
  const max = options.max ?? 2000
  const emptyAs = options.emptyAs ?? 'undefined'

  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      if (trimmed.length > 0) return trimmed
      return emptyAs === 'null' ? null : undefined
    },
    z.string().max(max, `Máximo ${max} caracteres`).nullish(),
  )
}

export function optionalSearch(max = 100) {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    },
    z.string().max(max, `Máximo ${max} caracteres`).optional(),
  )
}

export function csvValuesSchema(values: readonly string[], message = 'Valor inválido') {
  const allowed = new Set(values)
  return z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    )
    .refine(
      (items) => items.length > 0 && items.every((item) => allowed.has(item)),
      message,
    )
    .transform((items) => [...new Set(items)].join(','))
    .optional()
}

export const commaSeparatedIdsSchema = z
  .string()
  .trim()
  .transform((value) => value.split(',').map((item) => Number(item.trim())))
  .pipe(z.array(z.number().int().positive()))
