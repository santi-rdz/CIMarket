'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProduct, deleteProduct } from '@/app/services/productApi'
import type { ProductInput } from '@cm/shared/schemas/product'
import { toastApiError } from '@/app/lib/fetchApi'
import { toast } from 'sonner'

function token() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
}

/** Keys affected any time a product's data changes */
function invalidateProductQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['product'] })
  qc.invalidateQueries({ queryKey: ['products'] })
  qc.invalidateQueries({ queryKey: ['user-products'] })
  qc.invalidateQueries({ queryKey: ['relatedProducts'] })
}

export function useUpdateProduct(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ProductInput>) => updateProduct(productId, data, token()),
    onSuccess: () => {
      invalidateProductQueries(qc)
      toast.success('Producto actualizado')
    },
    onError: toastApiError,
  })
}

export function useDeleteProduct(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteProduct(productId, token()),
    onSuccess: () => {
      invalidateProductQueries(qc)
      // Removed product may still be in someone's favorites list
      qc.invalidateQueries({ queryKey: ['user-favorites'] })
      toast.success('Producto eliminado')
    },
    onError: toastApiError,
  })
}

export function useUpdateProductStatus(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: string) =>
      updateProduct(productId, { status } as Partial<ProductInput>, token()),
    onSuccess: () => {
      invalidateProductQueries(qc)
      toast.success('Estado actualizado')
    },
    onError: toastApiError,
  })
}
