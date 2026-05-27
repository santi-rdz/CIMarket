'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('token-change'))
    queryClient.removeQueries({ queryKey: ['me'] })
    router.push('/login')
  }
}
