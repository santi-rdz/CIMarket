'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { loginWithGoogle, type LoginResponse } from '@/app/services/authApi'

type Options = {
  onSuccess?: () => void
}

export function useLogin({ onSuccess }: Options = {}) {
  const router = useRouter()
  const qc = useQueryClient()
  const [campusSetup, setCampusSetup] = useState<{ userId: string } | null>(null)

  function finishLogin() {
    qc.invalidateQueries({ queryKey: ['me'] })
    onSuccess ? onSuccess() : router.push('/productos')
  }

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data: LoginResponse) => {
      localStorage.setItem('token', data.token)
      if (data.isNewUser) {
        setCampusSetup({ userId: data.user.id })
      } else {
        finishLogin()
      }
    },
  })

  const onCampusDone = () => {
    setCampusSetup(null)
    finishLogin()
  }

  return {
    login: (idToken: string) => mutate(idToken),
    loading: isPending,
    error: error?.message ?? null,
    campusSetup,
    onCampusDone,
  }
}
