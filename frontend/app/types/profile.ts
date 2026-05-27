import type { Product } from './product'

export type UserProfile = {
  id: string
  name: string
  email: string
  photoUrl: string | null
  rol: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'BANNED'
  createdAt: string
  _count: {
    products: number
    favorites: number
    sellerReviews: number
  }
  rating: {
    average: number
    count: number
  }
}

export type PublicProfile = {
  id: string
  name: string
  photoUrl: string | null
  createdAt: string
  _count: {
    products: number
    sellerReviews: number
  }
  rating: {
    average: number
    count: number
  }
}

export type UserPreferences = {
  emailNotifications: boolean
  showContactInfo: boolean
  defaultCampuses: Campus[]
}

export type ProfileReview = {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  reviewer: {
    id: string
    name: string
    photoUrl: string | null
  }
  product: {
    id: string
    title: string
    slug: string
  }
}

export type ProductsPage = {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
