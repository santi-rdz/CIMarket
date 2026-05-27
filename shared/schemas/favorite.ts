import { z } from 'zod'
import { paginationSchema } from './common'

export const favoriteSchema = z.object({
  userId: z.uuid(),
  productId: z.uuid(),
})

export type FavoriteInput = z.infer<typeof favoriteSchema>

export const validateFavorite = (input: unknown) => favoriteSchema.safeParse(input)

export const favoriteToggleSchema = favoriteSchema.pick({ productId: true })

export const favoritesQuerySchema = paginationSchema.extend({
  userId: z.uuid().optional(),
})

export type FavoritesQuery = z.infer<typeof favoritesQuerySchema>
