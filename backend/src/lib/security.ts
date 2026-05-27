import type { CorsOptions } from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { isProduction, serverConfig } from '#config/env'

const RATE_LIMIT_MESSAGE = {
  message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  code: 'RATE_LIMITED',
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || serverConfig.corsOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 24 * 60 * 60,
}

export const socketCorsOptions = {
  origin: serverConfig.corsOrigins,
  credentials: true,
}

export const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  hsts: isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...serverConfig.corsOrigins],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
})

export const apiRateLimiter = isProduction
  ? rateLimit({
      windowMs: serverConfig.rateLimitWindowMs,
      limit: serverConfig.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: RATE_LIMIT_MESSAGE,
    })
  : (_req: any, _res: any, next: any) => next()

export const authRateLimiter = isProduction
  ? rateLimit({
      windowMs: serverConfig.authRateLimitWindowMs,
      limit: serverConfig.authRateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: RATE_LIMIT_MESSAGE,
    })
  : (_req: any, _res: any, next: any) => next()
