import type { RequestHandler } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { USER_STATUS } from '@cm/shared/constants'
import { googleAuthSchema } from '@cm/shared/schemas/auth'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { GOOGLE_CLIENT_ID, signToken } from '#config/auth'
import UserModel from '#models/User'
import RefreshTokenModel from '#models/RefreshToken'
import {
  REFRESH_TOKEN_COOKIE,
  readCookie,
  setRefreshCookie,
  clearRefreshCookie,
} from '#lib/cookies'

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

export default class AuthController {
  /** POST /auth/google — recibe { idToken } del frontend, emite access + refresh token */
  static google: RequestHandler = async (req, res) => {
    const parsed = googleAuthSchema.safeParse(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const { idToken } = parsed.data

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      if (!payload || !payload.sub || !payload.email) {
        res.status(401).json({ error: 'Invalid Google token' })
        return
      }
      if (payload.email_verified !== true) {
        res.status(401).json({ error: 'No pudimos verificar tu correo de Google' })
        return
      }

      const user = await UserModel.upsertByGoogleId(payload.sub, {
        name: payload.name ?? payload.email,
        email: payload.email.trim().toLowerCase(),
        photoUrl: payload.picture?.trim() || null,
      })

      if (user.status === USER_STATUS.BANNED) {
        res.status(403).json({ error: 'Account suspended' })
        return
      }

      const [accessToken, refreshToken] = await Promise.all([
        signToken({ sub: user.id, email: user.email, rol: user.rol }),
        RefreshTokenModel.issue(user.id),
      ])

      setRefreshCookie(res, refreshToken)
      res.json({
        token: accessToken,
        isNewUser: user.isNewUser,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photoUrl: user.photoUrl,
          rol: user.rol,
        },
      })
    } catch {
      res.status(401).json({ error: 'Google authentication failed' })
    }
  }

  /** GET /auth/me — devuelve el usuario autenticado */
  static me: RequestHandler = async (req, res) => {
    const user = await UserModel.getById(req.user!.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  }

  /**
   * POST /auth/refresh — renueva el access token usando el refresh token de la cookie.
   * Aplica rotación: el refresh token usado queda revocado y se emite uno nuevo.
   * No requiere Authorization header — el refresh token es la credencial.
   */
  static refresh: RequestHandler = async (req, res) => {
    const raw = readCookie(req, REFRESH_TOKEN_COOKIE)
    if (!raw) {
      res.status(401).json({ error: 'Missing refresh token' })
      return
    }

    const userId = await RefreshTokenModel.rotate(raw)
    if (!userId) {
      clearRefreshCookie(res)
      res.status(401).json({ error: 'Invalid or expired session' })
      return
    }

    const user = await UserModel.getById(userId)
    if (!user) {
      clearRefreshCookie(res)
      res.status(401).json({ error: 'User not found' })
      return
    }

    const [accessToken, newRefreshToken] = await Promise.all([
      signToken({ sub: user.id, email: user.email, rol: user.rol }),
      RefreshTokenModel.issue(user.id),
    ])

    setRefreshCookie(res, newRefreshToken)
    res.json({ token: accessToken })
  }

  /**
   * POST /auth/logout — revoca el refresh token activo y limpia la cookie.
   * No requiere Authorization header: el access token ya pudo haber expirado.
   */
  static logout: RequestHandler = async (req, res) => {
    const raw = readCookie(req, REFRESH_TOKEN_COOKIE)
    if (raw) await RefreshTokenModel.revoke(raw)
    clearRefreshCookie(res)
    res.status(204).send()
  }
}
