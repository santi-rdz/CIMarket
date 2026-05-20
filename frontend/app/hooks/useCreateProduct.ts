import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '@/app/services/productApi'
import type { ProductInput } from '@cm/shared/schemas/product'
import { toastApiError } from '@/app/lib/fetchApi'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  return useMutation({
    mutationFn: (data: ProductInput) => createProduct(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['user-products'] })
    },
    onError: toastApiError,
  })
}
