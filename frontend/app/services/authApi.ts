import { fetchApi } from '@/app/lib/fetchApi'
import type { AuthUser } from '@cm/shared/schemas/user'

export type LoginResponse = { token: string; isNewUser: boolean; user: AuthUser }

export function loginWithGoogle(idToken: string) {
  return fetchApi<LoginResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}
