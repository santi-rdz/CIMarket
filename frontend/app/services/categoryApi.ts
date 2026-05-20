import { fetchApi } from '@/app/lib/fetchApi'
import type { Category } from '@/app/types/category'

export function getCategories() {
  return fetchApi<Category[]>('/categories')
}
