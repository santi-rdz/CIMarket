import { fetchApi } from '@/app/lib/fetchApi'
import type { AuthUser } from '@cm/shared/schemas/user'

export function getMe(token: string) {
  return fetchApi<AuthUser>('/auth/me', { token })
}
