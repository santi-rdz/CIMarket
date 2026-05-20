import type { RequestHandler } from 'express'
import { verifyToken } from '#config/auth'

/** Verifica JWT en Authorization: Bearer <token> e inyecta req.user */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = await verifyToken(token)
    req.user = { id: payload.sub, email: payload.email, rol: payload.rol }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/** Igual que requireAuth pero no falla si no hay token — req.user queda undefined */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.slice(7)
      const payload = await verifyToken(token)
      req.user = { id: payload.sub, email: payload.email, rol: payload.rol }
    } catch {
      // token inválido — seguimos sin user
    }
  }
  next()
}
