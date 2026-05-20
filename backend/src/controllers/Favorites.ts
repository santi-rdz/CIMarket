import type { RequestHandler } from 'express'
import { favoritesQuerySchema } from '@cm/shared/schemas/favorite'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { parsePagination } from '#lib/utils'
import FavoriteModel from '#models/Favorite'
import { uuidSchema } from '@cm/shared/schemas/fields'

export default class FavoriteController {
  /** GET /favorites?userId=xxx */
  static getAll: RequestHandler = async (req, res) => {
    const parsed = favoritesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query params', details: formatZodErrors(parsed.error) })
      return
    }
    const { page, limit } = parsePagination(parsed.data)
    const result = await FavoriteModel.getByUser({ ...parsed.data, page, limit })
    res.json(result)
  }

  /** GET /favorites/check/:productId — ¿el usuario autenticado tiene este producto en favoritos? */
  static check: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.productId)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const existing = await FavoriteModel.exists(req.user!.id, parsed.data)
    res.json({ favorited: !!existing })
  }

  /** POST /favorites — toggle con userId del token */
  static toggle: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.body.productId)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const result = await FavoriteModel.toggle(req.user!.id, parsed.data)
    res.json(result)
  }
}
