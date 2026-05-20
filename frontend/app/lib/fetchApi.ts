import { toast } from 'sonner'
import { API_URL } from './constants'

export type ApiField = { field: string; message: string }

export class ApiError extends Error {
  fields: ApiField[]
  status: number

  constructor(message: string, status: number, fields: ApiField[] = []) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

type FetchOptions = RequestInit & { token?: string }

export async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const fields: ApiField[] = body.details ?? []
    throw new ApiError(body.error ?? 'Error inesperado', res.status, fields)
  }

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text)
}

export function toastApiError(error: unknown) {
  if (error instanceof ApiError && error.fields.length > 0) {
    toast.error(error.message, {
      description: error.fields.map((f) => `• ${f.message}`).join('\n'),
      style: { whiteSpace: 'pre-line' },
    })
  } else if (error instanceof Error) {
    toast.error(error.message)
  } else {
    toast.error('Ocurrió un error inesperado')
  }
}
