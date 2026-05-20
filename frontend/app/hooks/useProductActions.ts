'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProduct, deleteProduct } from '@/app/services/productApi'
import type { ProductInput } from '@cm/shared/schemas/product'
import { toastApiError } from '@/app/lib/fetchApi'
import { toast } from 'sonner'

function token() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
}

export function useUpdateProduct(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ProductInput>) => updateProduct(productId, data, token()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['user-products'] })
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
      qc.invalidateQueries({ queryKey: ['product'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['user-products'] })
      toast.success('Producto eliminado')
    },
    onError: toastApiError,
  })
}

export function useUpdateProductStatus(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: string) => updateProduct(productId, { status } as Partial<ProductInput>, token()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['user-products'] })
      toast.success('Estado actualizado')
    },
    onError: toastApiError,
  })
}
