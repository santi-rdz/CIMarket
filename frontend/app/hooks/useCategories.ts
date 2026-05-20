import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/app/services/categoryApi'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30 min — rarely changes
  })
}
