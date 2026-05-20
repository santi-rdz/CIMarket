import type { RequestHandler } from 'express'
import { validateProduct, validatePartialProduct, productsQuerySchema } from '@cm/shared/schemas/product'
import { uuidSchema } from '@cm/shared/schemas/fields'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { parsePagination } from '#lib/utils'
import ProductModel from '#models/Product'

export default class ProductController {
  static getAll: RequestHandler = async (req, res) => {
    const parsed = productsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query params', details: formatZodErrors(parsed.error) })
      return
    }
    const { page, limit } = parsePagination(parsed.data)
    const result = await ProductModel.getAll({ ...parsed.data, page, limit })
    res.json(result)
  }

  static getById: RequestHandler = async (req, res) => {
    const param = req.params.id
    const isUuid = uuidSchema.safeParse(param).success
    const product = isUuid
      ? await ProductModel.getById(param)
      : await ProductModel.getBySlug(param)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json(product)
  }

  static create: RequestHandler = async (req, res) => {
    const parsed = validateProduct(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const product = await ProductModel.create({ ...parsed.data, userId: req.user!.id })
    res.status(201).json(product)
  }

  static update: RequestHandler = async (req, res) => {
    const idParsed = uuidSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const bodyParsed = validatePartialProduct(req.body)
    if (!bodyParsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const existing = await ProductModel.getById(idParsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    if (existing.user.id !== req.user!.id) {
      res.status(403).json({ error: 'No tienes permiso para editar este producto' })
      return
    }
    const product = await ProductModel.update(idParsed.data, bodyParsed.data)
    res.json(product)
  }

  static delete: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const existing = await ProductModel.getById(parsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    if (existing.user.id !== req.user!.id) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este producto' })
      return
    }
    await ProductModel.delete(parsed.data)
    res.status(204).send()
  }
}
