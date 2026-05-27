import type { Request, Response } from 'express'
import { isProduction } from '#config/env'
import { REFRESH_TOKEN_TTL_MS } from '#config/auth'

export const REFRESH_TOKEN_COOKIE = 'refresh_token'

/**
 * Lee una cookie del header sin necesitar cookie-parser.
 * res.cookie() es nativo de Express; solo req.cookies requiere el middleware.
 */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie
  if (!header) return undefined
  const pair = header.split(';').find((c) => c.trim().startsWith(`${name}=`))
  return pair ? decodeURIComponent(pair.split('=').slice(1).join('=').trim()) : undefined
}

/** Establece la cookie httpOnly del refresh token en la respuesta */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_TTL_MS,
  })
}

/** Limpia la cookie del refresh token */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  })
}
