import { fetchApi } from '@/app/lib/fetchApi'
import type { Campus } from '@/app/types/campus'

export function getCampuses() {
  return fetchApi<Campus[]>('/campuses')
}
