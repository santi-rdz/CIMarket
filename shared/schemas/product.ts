import { z } from 'zod'
import { PRODUCT_CONDITIONS, PRODUCT_STATUSES } from '../constants'
import {
  commaSeparatedIdsSchema,
  csvValuesSchema,
  optionalSearch,
  paginationSchema,
  requiredText,
} from './common'

export const productSchema = z.object({
  title: requiredText('El título es requerido'),
  description: requiredText('La descripción es requerida', { max: 5000 }),
  price: z.coerce
    .number({ error: 'Ingresa un precio válido' })
    .positive('El precio debe ser mayor a 0')
    .max(999999.99, 'El precio es demasiado alto'),
  condition: z.enum(PRODUCT_CONDITIONS, { error: 'Selecciona una condición válida' }),
  status: z.enum(PRODUCT_STATUSES).optional(),
  categoryId: z.number({ error: 'Selecciona una categoría' }).int().positive(),
  campusIds: z.array(z.number().int().positive()).optional(),
  images: z.array(z.string().trim().pipe(z.url().max(2048))).optional(),
})

export type ProductInput = z.infer<typeof productSchema>

export const productFormSchema = productSchema
  .omit({ status: true, images: true })
  .extend({
    campusIds: z
      .array(z.number().int().positive())
      .min(1, 'Selecciona al menos un campus'),
  })

export type ProductFormInput = z.infer<typeof productFormSchema>

export const validateProduct = (input: unknown) => productSchema.safeParse(input)
export const validatePartialProduct = (input: unknown) =>
  productSchema.partial().safeParse(input)

export const productsQuerySchema = paginationSchema.extend({
  search: optionalSearch(),
  status: csvValuesSchema(PRODUCT_STATUSES, 'Estado de producto inválido'),
  condition: csvValuesSchema(PRODUCT_CONDITIONS, 'Condición de producto inválida'),
  categoryIds: commaSeparatedIdsSchema.optional(),
  userId: z.uuid().optional(),
  campusIds: commaSeparatedIdsSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price', 'createdAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export type ProductsQuery = z.infer<typeof productsQuerySchema>
