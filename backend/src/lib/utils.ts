import { DEFAULT_PAGE, MAX_PAGE_SIZE, PAGE_SIZE } from '@cm/shared/constants'

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE)
  const limit = Math.min(Math.max(1, Number(query.limit) || PAGE_SIZE), MAX_PAGE_SIZE)
  return { page, limit }
}
