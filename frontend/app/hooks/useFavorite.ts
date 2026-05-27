'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkFavorite, toggleFavorite } from '@/app/services/favoritesApi'
import { useMe } from './useMe'

export function useFavorite(productId: string) {
  const { data: user } = useMe()
  const qc = useQueryClient()
  const key = ['favorite', productId]

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => checkFavorite(productId),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: () => toggleFavorite(productId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<{ favorited: boolean }>(key)
      qc.setQueryData(key, { favorited: !prev?.favorited })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.prev)
    },
    onSuccess: (result) => {
      qc.setQueryData(key, result)
      qc.invalidateQueries({ queryKey: ['user-favorites'] })
    },
  })

  return {
    favorited: data?.favorited ?? false,
    isLoading,
    isPending,
    toggle,
    isLoggedIn: !!user,
  }
}
