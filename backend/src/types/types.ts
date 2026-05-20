// ─── Prisma Models ───────────────────────────────────────────────────────────
export type {
  UserModel,
  ProductModel,
  ProductImageModel,
  CategoryModel,
  CampusModel,
  FavoriteModel,
  ReviewModel,
} from '#generated/prisma/models'

// ─── Shared schemas ───────────────────────────────────────────────────────────
export type { ProductInput, ProductsQuery } from '@cm/shared/schemas/product'
export type { UserInput, UsersQuery, AuthUser } from '@cm/shared/schemas/user'
export type { ReviewInput, ReviewsQuery } from '@cm/shared/schemas/review'
export type { FavoritesQuery } from '@cm/shared/schemas/favorite'

// ─── Shared enums/constants ───────────────────────────────────────────────────
export type {
  UserRole,
  UserStatus,
  ProductCondition,
  ProductStatus,
} from '@cm/shared/constants'

// ─── API response shapes ──────────────────────────────────────────────────────
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
