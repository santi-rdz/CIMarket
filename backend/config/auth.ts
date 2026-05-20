import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_ISSUER = 'cimarket'
const JWT_EXPIRATION = '7d'

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!

export interface AuthPayload extends JWTPayload {
  sub: string
  email: string
  rol: string
}

export async function signToken(payload: Pick<AuthPayload, 'sub' | 'email' | 'rol'>): Promise<string> {
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
