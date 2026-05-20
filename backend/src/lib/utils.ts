import { DEFAULT_PAGE, MAX_PAGE_SIZE, PAGE_SIZE } from '@cm/shared/constants'

export function parsePagination(query: Record<string, any>) {
  const page = Math.max(1, +query.page || DEFAULT_PAGE)
  const limit = Math.min(Math.max(1, +query.limit || PAGE_SIZE), MAX_PAGE_SIZE)
  return { page, limit }
}
