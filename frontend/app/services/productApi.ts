import { fetchApi } from '@/app/lib/fetchApi'
import type { ProductInput, ProductsQuery } from '@cm/shared/schemas/product'
import type { Product, ProductDetail, ProductsResponse } from '@/app/types/product'

export type { Product, ProductDetail, ProductsResponse }

export function getProducts(query: Partial<ProductsQuery> = {}, options?: { token?: string; signal?: AbortSignal }) {
  const params = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return fetchApi<ProductsResponse>(`/products${params ? `?${params}` : ''}`, { token: options?.token, signal: options?.signal })
}

export function getProduct(slugOrId: string, token?: string) {
  return fetchApi<ProductDetail>(`/products/${slugOrId}`, { token })
}

export function createProduct(data: ProductInput, token: string) {
  return fetchApi<ProductDetail>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  })
}

export function updateProduct(id: string, data: Partial<ProductInput>, token: string) {
  return fetchApi<ProductDetail>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  })
}

export function deleteProduct(id: string, token: string) {
  return fetchApi<void>(`/products/${id}`, { method: 'DELETE', token })
}
