import { fetchApi } from '@/app/lib/fetchApi'
import type { AuthUser } from '@cm/shared/schemas/user'

export type LoginResponse = { token: string; isNewUser: boolean; user: AuthUser }
export type RefreshResponse = { token: string }

export function loginWithGoogle(idToken: string) {
  return fetchApi<LoginResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}

export function refreshToken() {
  return fetchApi<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    skipRefresh: true, // Evitar recursión infinita
  })
}

export function logout() {
  return fetchApi('/auth/logout', {
    method: 'POST',
    skipRefresh: true,
  })
}
