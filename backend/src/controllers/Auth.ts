import type { RequestHandler } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { USER_STATUS } from '@cm/shared/constants'
import { googleAuthSchema } from '@cm/shared/schemas/auth'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { GOOGLE_CLIENT_ID, signToken } from '#config/auth'
import UserModel from '#models/User'

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

export default class AuthController {
  /** POST /auth/google — recibe { idToken, campusId } del frontend */
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

      // if (!payload.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      //   res.status(403).json({ error: `Solo cuentas @${ALLOWED_EMAIL_DOMAIN} permitidas` })
      //   return
      // }

      const user = await UserModel.upsertByGoogleId(payload.sub, {
        name: payload.name ?? payload.email,
        email: payload.email.trim().toLowerCase(),
        photoUrl: payload.picture?.trim() || null,
      })

      if (user.status === USER_STATUS.BANNED) {
        res.status(403).json({ error: 'Account suspended' })
        return
      }

      const token = await signToken({
        sub: user.id,
        email: user.email,
        rol: user.rol,
      })

      res.json({
        token,
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
}
