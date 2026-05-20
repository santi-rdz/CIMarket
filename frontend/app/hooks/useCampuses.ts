import { useQuery } from '@tanstack/react-query'
import { getCampuses } from '@/app/services/campusApi'

export function useCampuses() {
  return useQuery({
    queryKey: ['campuses'],
    queryFn: getCampuses,
    staleTime: 1000 * 60 * 30,
  })
}
