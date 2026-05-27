import type { ErrorRequestHandler, RequestHandler } from 'express'

type ErrorBody = {
  error?: unknown
  message?: unknown
  code?: unknown
  details?: unknown
}

type ValidationIssue = {
  field: string
  message: string
}

const STATUS_CODE_BY_HTTP_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_SERVER_ERROR',
}

const DEFAULT_MESSAGE_BY_HTTP_STATUS: Record<number, string> = {
  400: 'Solicitud inválida',
  401: 'No autorizado',
  403: 'No tienes permiso',
  404: 'Recurso no encontrado',
  409: 'Conflicto con el estado actual del recurso',
  422: 'No se pudo procesar la solicitud',
  429: 'Demasiadas solicitudes',
  500: 'Ocurrió un error inesperado',
}

const MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Account suspended': 'Tu cuenta está suspendida',
  'Already reviewed this seller': 'Ya reseñaste a este vendedor',
  'Cannot create conversation with yourself':
    'No puedes iniciar una conversación contigo mismo',
  'Cannot report yourself': 'No puedes reportarte a ti mismo',
  'Cannot review yourself': 'No puedes dejarte una reseña a ti mismo',
  'Campus not found': 'Campus no encontrado',
  'Category not found': 'Categoría no encontrada',
  'Conversation not found': 'Conversación no encontrada',
  'Conversation not found or unauthorized': 'Conversación no encontrada o sin permiso',
  'Email already registered': 'Ese correo ya está registrado',
  'Google authentication failed': 'No se pudo iniciar sesión con Google',
  'Invalid Google token': 'La sesión de Google no es válida',
  'Invalid campus ID': 'ID de campus inválido',
  'Invalid category ID': 'ID de categoría inválido',
  'Invalid conversation ID': 'ID de conversación inválido',
  'Invalid id': 'ID inválido',
  'Invalid or expired token': 'Tu sesión expiró. Vuelve a iniciar sesión',
  'Invalid product ID': 'ID de producto inválido',
  'Invalid query params': 'Parámetros de consulta inválidos',
  'Invalid review ID': 'ID de reseña inválido',
  'Invalid subscription data': 'Datos de suscripción inválidos',
  'Invalid transaction ID': 'ID de transacción inválido',
  'Invalid user ID': 'ID de usuario inválido',
  'Message content cannot be empty': 'El mensaje no puede estar vacío',
  'Missing or invalid Authorization header': 'Inicia sesión para continuar',
  'Product not found': 'Producto no encontrado',
  'Review not found': 'Reseña no encontrada',
  'Route not found': 'Ruta no encontrada',
  'Transaction not found': 'Transacción no encontrada',
  'User not found': 'Usuario no encontrado',
  'Validation failed': 'Revisa los datos e inténtalo de nuevo',
  'Authentication required': 'Inicia sesión para continuar',
  'Insufficient permissions': 'No tienes permiso para realizar esta acción',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function translateMessage(message: string): string {
  return MESSAGE_TRANSLATIONS[message] ?? message
}

function toHttpStatus(value: unknown): number {
  const status = typeof value === 'number' ? value : 500
  return status >= 400 && status <= 599 ? status : 500
}

function toErrorCode(message: string, status: number): string {
  const normalized = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()

  return normalized || STATUS_CODE_BY_HTTP_STATUS[status] || 'ERROR'
}

function sanitizeMessage(message: unknown, status: number): string {
  if (status >= 500) return DEFAULT_MESSAGE_BY_HTTP_STATUS[500]
  if (typeof message === 'string' && message.trim())
    return translateMessage(message.trim())
  return DEFAULT_MESSAGE_BY_HTTP_STATUS[status] ?? 'Error en la solicitud'
}

function sanitizeDetails(details: unknown): ValidationIssue[] | undefined {
  if (!Array.isArray(details)) return undefined

  const issues = details.flatMap((detail) => {
    if (!isRecord(detail)) return []
    const field = typeof detail.field === 'string' ? detail.field.trim() : ''
    const message = typeof detail.message === 'string' ? detail.message.trim() : ''
    if (!field || !message) return []
    return [{ field, message }]
  })

  return issues.length ? issues : undefined
}

function prismaErrorStatus(error: Record<string, unknown>): number | undefined {
  if (typeof error.code !== 'string' || !error.code.startsWith('P')) return undefined

  switch (error.code) {
    case 'P2002':
    case 'P2003':
    case 'P2014':
      return 409
    case 'P2025':
      return 404
    case 'P2000':
    case 'P2005':
    case 'P2006':
    case 'P2011':
    case 'P2012':
    case 'P2013':
    case 'P2019':
    case 'P2020':
      return 400
    default:
      return 500
  }
}

function prismaErrorMessage(
  error: Record<string, unknown>,
  status: number,
): string | undefined {
  if (typeof error.code !== 'string' || !error.code.startsWith('P')) return undefined

  switch (error.code) {
    case 'P2002':
      return 'Ya existe un registro con esos datos'
    case 'P2003':
    case 'P2014':
      return 'No se puede completar la operación por el estado actual del recurso'
    case 'P2025':
      return DEFAULT_MESSAGE_BY_HTTP_STATUS[404]
    default:
      return DEFAULT_MESSAGE_BY_HTTP_STATUS[status] ?? DEFAULT_MESSAGE_BY_HTTP_STATUS[500]
  }
}

function errorStatus(error: unknown): number {
  if (!isRecord(error)) return 500

  const prismaStatus = prismaErrorStatus(error)
  if (prismaStatus) return prismaStatus

  return toHttpStatus(error.status ?? error.statusCode)
}

function errorCodeFromUnknown(error: unknown, status: number): string {
  if (isRecord(error) && error.type === 'entity.parse.failed') return 'MALFORMED_JSON'
  if (isRecord(error) && typeof error.code === 'string' && !error.code.startsWith('P')) {
    return error.code
  }
  return STATUS_CODE_BY_HTTP_STATUS[status] ?? 'INTERNAL_SERVER_ERROR'
}

function errorMessageFromUnknown(error: unknown, status: number): string {
  if (status >= 500) return DEFAULT_MESSAGE_BY_HTTP_STATUS[500]
  if (isRecord(error) && error.type === 'entity.parse.failed') {
    return 'JSON inválido en el cuerpo de la solicitud'
  }
  if (isRecord(error)) {
    const prismaMessage = prismaErrorMessage(error, status)
    if (prismaMessage) return prismaMessage
  }
  if (isRecord(error) && typeof error.message === 'string')
    return sanitizeMessage(error.message, status)
  return sanitizeMessage(undefined, status)
}

export function normalizeApiErrorBody(body: unknown, statusCode: number) {
  const status = toHttpStatus(statusCode)
  const rawBody: ErrorBody = isRecord(body) ? body : {}
  const error = isRecord(rawBody.error) ? rawBody.error : rawBody
  const codeSource = error.message ?? rawBody.message ?? rawBody.error
  const message = sanitizeMessage(codeSource, status)
  const code =
    typeof error.code === 'string'
      ? error.code
      : typeof rawBody.code === 'string'
        ? rawBody.code
        : toErrorCode(typeof codeSource === 'string' ? codeSource : message, status)
  const details = sanitizeDetails(error.details ?? rawBody.details)

  return {
    message,
    code,
    ...(details && { details }),
  }
}

export const normalizeErrorResponses: RequestHandler = (_req, res, next) => {
  const json = res.json.bind(res)

  res.json = ((body?: unknown) => {
    if (res.statusCode >= 400) {
      return json(normalizeApiErrorBody(body, res.statusCode))
    }
    return json(body)
  }) as typeof res.json

  next()
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
  })
}

export const apiErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error)
    return
  }

  const status = errorStatus(error)
  const body = {
    message: errorMessageFromUnknown(error, status),
    code: errorCodeFromUnknown(error, status),
  }

  if (status >= 500) {
    console.error(error)
  }

  res.status(status).json(body)
}
