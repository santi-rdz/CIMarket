import type { RequestHandler } from 'express'
import { idSchema } from '@cm/shared/schemas/fields'
import CampusModel from '#models/Campus'

export default class CampusController {
  /** GET /campuses — lista todos los campus */
  static getAll: RequestHandler = async (_req, res) => {
    const campuses = await CampusModel.getAll()
    res.json(campuses)
  }

  /** GET /campuses/:id */
  static getById: RequestHandler = async (req, res) => {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid campus ID' })
      return
    }
    const campus = await CampusModel.getById(parsed.data)
    if (!campus) {
      res.status(404).json({ error: 'Campus not found' })
      return
    }
    res.json(campus)
  }
}
