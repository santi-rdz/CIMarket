import { fetchApi } from '@/app/lib/fetchApi'
import type {
  UserProfile,
  UserPreferences,
  ProfileReview,
  ProductsPage,
} from '@/app/types/profile'

function token() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
}

// ─── Own profile (requires userId from auth state) ───────────────────────────

export function getUserProfile(userId: string) {
  return fetchApi<UserProfile>(`/users/${userId}`, { token: token() })
}

export function updateUserProfile(userId: string, data: { name?: string }) {
  return fetchApi<UserProfile>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token: token(),
  })
}

export function deleteUserAccount(userId: string) {
  return fetchApi<void>(`/users/${userId}`, { method: 'DELETE', token: token() })
}

export function getUserProducts(userId: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: '12' })
  if (status) params.set('status', status)
  return fetchApi<ProductsPage>(`/users/${userId}/products?${params}`, { token: token() })
}

export function getUserFavorites(userId: string, page = 1) {
  return fetchApi<ProductsPage>(`/users/${userId}/favorites?page=${page}&limit=12`, {
    token: token(),
  })
}

export function getUserReviews(userId: string) {
  return fetchApi<ProfileReview[]>(`/users/${userId}/reviews`, { token: token() })
}

export function getUserPreferences(userId: string) {
  return fetchApi<UserPreferences>(`/users/${userId}/preferences`, { token: token() })
}

export function updateUserPreferences(
  userId: string,
  data: {
    emailNotifications?: boolean
    showContactInfo?: boolean
    campusIds?: number[]
  },
) {
  return fetchApi<UserPreferences>(`/users/${userId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token: token(),
  })
}
