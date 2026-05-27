import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { createHash, randomBytes } from 'node:crypto'
import { requiredEnv, requiredSecret } from '#config/env'

const JWT_SECRET = new TextEncoder().encode(requiredSecret('JWT_SECRET'))
const JWT_ISSUER = 'cimarket'
const JWT_EXPIRATION = process.env.JWT_EXPIRATION?.trim() || '15m'

export const GOOGLE_CLIENT_ID = requiredEnv('GOOGLE_CLIENT_ID')

/** TTL del refresh token en ms (7 días) */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface AuthPayload extends JWTPayload {
  sub: string
  email: string
  rol: string
}

export async function signToken(
  payload: Pick<AuthPayload, 'sub' | 'email' | 'rol'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET, { issuer: JWT_ISSUER })
  return payload as AuthPayload
}

/** Genera un token opaco aleatorio de 32 bytes (hex) */
export function generateRawToken(): string {
  return randomBytes(32).toString('hex')
}

/** Devuelve el SHA-256 del token — lo que se almacena en DB, nunca el raw */
export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}
