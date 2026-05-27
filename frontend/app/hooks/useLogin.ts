'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { loginWithGoogle, type LoginResponse } from '@/app/services/authApi'

type Options = {
  onSuccess?: () => void
}

export function useLogin({ onSuccess }: Options = {}) {
  const router = useRouter()
  const qc = useQueryClient()

  function finishLogin() {
    qc.invalidateQueries({ queryKey: ['me'] })
    if (onSuccess) onSuccess()
    else router.push('/productos')
  }

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem('token', data.token)
      void window.dispatchEvent(new Event('token-change'))
      finishLogin()
    },
  })

  return {
    login: (idToken: string) => mutate(idToken),
    loading: isPending,
    error: error?.message ?? null,
  }
}
