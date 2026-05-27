import type { RequestHandler } from 'express'
import { validateCategory } from '@cm/shared/schemas/category'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { idSchema } from '@cm/shared/schemas/fields'
import CategoryModel from '#models/Category'

export default class CategoryController {
  static getAll: RequestHandler = async (_req, res) => {
    const categories = await CategoryModel.getAll()
    res.json(categories)
  }

  static getById: RequestHandler = async (req, res) => {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid category ID' })
      return
    }
    const category = await CategoryModel.getById(parsed.data)
    if (!category) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    res.json(category)
  }

  static create: RequestHandler = async (req, res) => {
    const parsed = validateCategory(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const category = await CategoryModel.create(parsed.data.name)
    res.status(201).json(category)
  }

  static update: RequestHandler = async (req, res) => {
    const idParsed = idSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      res.status(400).json({ error: 'Invalid category ID' })
      return
    }
    const bodyParsed = validateCategory(req.body)
    if (!bodyParsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const existing = await CategoryModel.getById(idParsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    const category = await CategoryModel.update(idParsed.data, bodyParsed.data.name)
    res.json(category)
  }

  static delete: RequestHandler = async (req, res) => {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid category ID' })
      return
    }
    const existing = await CategoryModel.getById(parsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    await CategoryModel.delete(parsed.data)
    res.status(204).send()
  }
}
