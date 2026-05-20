'use client'

import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/app/services/userApi'
import { ApiError } from '@/app/lib/fetchApi'

export function useMe() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await getMe(token!)
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          localStorage.removeItem('token')
        }
        throw err
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
