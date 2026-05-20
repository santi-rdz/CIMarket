import type { Campus } from './campus'
import type { Product } from './product'

export type UserProfile = {
  id: string
  name: string
  email: string
  photoUrl: string | null
  rol: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'BANNED'
  campus: Campus
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
  campus: Campus
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
  rating: string
  comment: string | null
  createdAt: string
  reviewer: {
    id: string
    name: string
    photoUrl: string | null
  }
}

export type ProductsPage = {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
