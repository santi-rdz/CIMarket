import { prisma } from '#config/prisma'
import { generateRawToken, hashRefreshToken, REFRESH_TOKEN_TTL_MS } from '#config/auth'

export default class RefreshTokenModel {
  /**
   * Emite un nuevo refresh token para el usuario.
   * Solo guarda el hash en DB — nunca el raw.
   * Retorna el token raw para enviarlo en la cookie.
   */
  static async issue(userId: string): Promise<string> {
    const raw = generateRawToken()
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashRefreshToken(raw),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    })
    return raw
  }

  /**
   * Valida y rota un refresh token.
   * - Revoca el token actual
   * - Retorna el userId si es válido, null si es inválido / expirado / ya revocado
   *
   * La rotación garantiza que un token robado sea detectado:
   * si el atacante lo usa primero, el token legítimo ya no será válido.
   */
  static async rotate(raw: string): Promise<string | null> {
    const tokenHash = hashRefreshToken(raw)
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } })

    if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) return null

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    return stored.userId
  }

  /**
   * Revoca un token específico por su valor raw (logout de un dispositivo).
   */
  static async revoke(raw: string): Promise<void> {
    const tokenHash = hashRefreshToken(raw)
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  /**
   * Revoca todos los tokens de un usuario (logout de todos los dispositivos).
   */
  static async revokeAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
}
