// Auth
export const ALLOWED_EMAIL_DOMAIN = 'uabc.edu.mx'

// Pagination
export const PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 20
export const DEFAULT_PAGE = 1

// Enums — fuente de verdad compartida (deben coincidir con prisma/schema.prisma)
export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
} as const

export const PRODUCT_CONDITION = {
  NUEVO: 'NUEVO',
  COMO_NUEVO: 'COMO_NUEVO',
  BUEN_ESTADO: 'BUEN_ESTADO',
  DIGITAL: 'DIGITAL',
} as const

export const PRODUCT_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  VENDIDO: 'VENDIDO',
  RESERVADO: 'RESERVADO',
} as const

// Arrays para z.enum()
export const USER_ROLES = Object.values(USER_ROLE)
export const USER_STATUSES = Object.values(USER_STATUS)
export const PRODUCT_CONDITIONS = Object.values(PRODUCT_CONDITION)
export const PRODUCT_STATUSES = Object.values(PRODUCT_STATUS)

// Types
export type UserRole = (typeof USER_ROLES)[number]
export type UserStatus = (typeof USER_STATUSES)[number]
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number]
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]
