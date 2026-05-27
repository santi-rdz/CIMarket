import 'dotenv/config'

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://frontend:5173',
]
const NODE_ENV = envValue('NODE_ENV') ?? 'development'
const IS_PRODUCTION = NODE_ENV === 'production'

function envValue(name: string) {
  const value = process.env[name]?.trim()
  return value || undefined
}

export function requiredEnv(name: string) {
  const value = envValue(name)
  if (!value) throw new Error(`${name} is required`)
  return value
}

export function requiredSecret(name: string, minLength = 32) {
  const value = requiredEnv(name)
  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters long`)
  }
  return value
}

function positiveIntEnv(name: string, fallback: number) {
  const value = Number(envValue(name))
  return Number.isInteger(value) && value > 0 ? value : fallback
}

function csvEnv(name: string, fallback: string[]) {
  const values = envValue(name)
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return values?.length ? values : fallback
}

function assertProductionCorsOrigins(origins: string[]) {
  if (!IS_PRODUCTION) return

  if (!envValue('CORS_ORIGINS')) {
    throw new Error('CORS_ORIGINS must be configured explicitly in production')
  }

  for (const origin of origins) {
    const url = new URL(origin)
    if (url.protocol !== 'https:') {
      throw new Error(`Production CORS origin must use HTTPS: ${origin}`)
    }
  }
}

const corsOrigins = csvEnv('CORS_ORIGINS', DEFAULT_CORS_ORIGINS)
assertProductionCorsOrigins(corsOrigins)

export const serverConfig = {
  nodeEnv: NODE_ENV,
  port: positiveIntEnv('PORT', 8000),
  corsOrigins,
  jsonBodyLimit: envValue('JSON_BODY_LIMIT') ?? '1mb',
  trustProxy: envValue('TRUST_PROXY') === 'true',
  rateLimitWindowMs: positiveIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMax: positiveIntEnv('RATE_LIMIT_MAX', 300),
  authRateLimitWindowMs: positiveIntEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  authRateLimitMax: positiveIntEnv('AUTH_RATE_LIMIT_MAX', 30),
}

export const isProduction = IS_PRODUCTION
