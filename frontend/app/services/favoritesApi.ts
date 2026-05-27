import { fetchApi } from '@/app/lib/fetchApi'

function token() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
}

export function checkFavorite(productId: string) {
  return fetchApi<{ favorited: boolean }>(`/favorites/check/${productId}`, {
    token: token(),
  })
}

export function toggleFavorite(productId: string) {
  return fetchApi<{ favorited: boolean }>('/favorites', {
    method: 'POST',
    body: JSON.stringify({ productId }),
    token: token(),
  })
}
