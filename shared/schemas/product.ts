import { z } from 'zod'
import { PRODUCT_CONDITIONS, PRODUCT_STATUSES } from '../constants'
import { paginationSchema } from './common'

export const productSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().min(1, 'La descripción es requerida').max(5000, 'Máximo 5000 caracteres'),
  price: z.coerce.number({ error: 'Ingresa un precio válido' }).positive('El precio debe ser mayor a 0').max(999999.99, 'El precio es demasiado alto'),
  condition: z.enum(PRODUCT_CONDITIONS, { error: 'Selecciona una condición válida' }),
  status: z.enum(PRODUCT_STATUSES).optional(),
  categoryId: z.number({ error: 'Selecciona una categoría' }).int().positive(),
  campusIds: z.array(z.number().int().positive()).optional(),
  images: z.array(z.url().max(2048)).optional(),
})

export type ProductInput = z.infer<typeof productSchema>

export const productFormSchema = productSchema
  .omit({ status: true, images: true })
  .extend({
    campusIds: z.array(z.number().int().positive()).min(1, 'Selecciona al menos un campus'),
  })

export type ProductFormInput = z.infer<typeof productFormSchema>

export const validateProduct = (input: unknown) => productSchema.safeParse(input)
export const validatePartialProduct = (input: unknown) =>
  productSchema.partial().safeParse(input)

export const productsQuerySchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  categoryIds: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .pipe(z.array(z.number().int().positive()))
    .optional(),
  userId: z.uuid().optional(),
  campusIds: z
    .string()
    .transform((val) => val.split(',').map(Number))
    .pipe(z.array(z.number().int().positive()))
    .optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price', 'createdAt', 'title']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export type ProductsQuery = z.infer<typeof productsQuerySchema>
