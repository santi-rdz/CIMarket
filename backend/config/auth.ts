import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { requiredEnv, requiredSecret } from '#config/env'

const JWT_SECRET = new TextEncoder().encode(requiredSecret('JWT_SECRET'))
const JWT_ISSUER = 'cimarket'
const JWT_EXPIRATION = process.env.JWT_EXPIRATION?.trim() || '7d'

export const GOOGLE_CLIENT_ID = requiredEnv('GOOGLE_CLIENT_ID')

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
