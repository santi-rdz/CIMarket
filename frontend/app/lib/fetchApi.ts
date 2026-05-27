import { toast } from 'sonner'
import { API_URL } from './constants'

export type ApiField = { field: string; message: string }

export class ApiError extends Error {
  fields: ApiField[]
  status: number
  code?: string

  constructor(message: string, status: number, fields: ApiField[] = [], code?: string) {
    super(message)
    this.status = status
    this.fields = fields
    this.code = code
  }
}

type FetchOptions = RequestInit & { token?: string }
type ApiErrorBody = {
  error?: string | { message?: string; code?: string; details?: ApiField[] }
  message?: string
  code?: string
  details?: ApiField[]
}

const MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Account suspended': 'Tu cuenta está suspendida',
  'Authentication required': 'Inicia sesión para continuar',
  'Email already registered': 'Ese correo ya está registrado',
  'Insufficient permissions': 'No tienes permiso para realizar esta acción',
  'Invalid or expired token': 'Tu sesión expiró. Vuelve a iniciar sesión',
  'Missing or invalid Authorization header': 'Inicia sesión para continuar',
  'Validation failed': 'Revisa los datos e inténtalo de nuevo',
}

function isErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && !Array.isArray(body)
}

function translateMessage(message: string) {
  return MESSAGE_TRANSLATIONS[message] ?? message
}

function parseApiError(rawBody: unknown, status: number) {
  const body = isErrorBody(rawBody) ? rawBody : {}
  const nested =
    typeof body.error === 'object' && body.error !== null ? body.error : undefined
  const message =
    nested?.message ??
    body.message ??
    (typeof body.error === 'string' ? body.error : undefined) ??
    'Error inesperado'
  const fields = nested?.details ?? body.details ?? []
  const code = nested?.code ?? body.code

  return new ApiError(translateMessage(message), status, fields, code)
}

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
    throw parseApiError(body, res.status)
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
