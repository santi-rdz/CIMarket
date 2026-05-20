import type { RequestHandler } from 'express'
import { validateReview, validatePartialReview, reviewsQuerySchema } from '@cm/shared/schemas/review'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { idSchema } from '@cm/shared/schemas/fields'
import { parsePagination } from '#lib/utils'
import ReviewModel from '#models/Review'

export default class ReviewController {
  static getAll: RequestHandler = async (req, res) => {
    const parsed = reviewsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query params', details: formatZodErrors(parsed.error) })
      return
    }
    const { page, limit } = parsePagination(parsed.data)
    const result = await ReviewModel.getAll({ ...parsed.data, page, limit })
    res.json(result)
  }

  static getById: RequestHandler = async (req, res) => {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }
    const review = await ReviewModel.getById(parsed.data)
    if (!review) {
      res.status(404).json({ error: 'Review not found' })
      return
    }
    res.json(review)
  }

  static create: RequestHandler = async (req, res) => {
    const parsed = validateReview(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    if (parsed.data.sellerId === parsed.data.reviewerId) {
      res.status(400).json({ error: 'Cannot review yourself' })
      return
    }
    const existing = await ReviewModel.existsByReviewerAndSeller(
      parsed.data.reviewerId,
      parsed.data.sellerId,
    )
    if (existing) {
      res.status(409).json({ error: 'Already reviewed this seller' })
      return
    }
    const review = await ReviewModel.create(parsed.data)
    res.status(201).json(review)
  }

  static update: RequestHandler = async (req, res) => {
    const idParsed = idSchema.safeParse(req.params.id)
    if (!idParsed.success) {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }
    const bodyParsed = validatePartialReview(req.body)
    if (!bodyParsed.success) {
      res.status(400).json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const existing = await ReviewModel.getById(idParsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Review not found' })
      return
    }
    const review = await ReviewModel.update(idParsed.data, bodyParsed.data)
    res.json(review)
  }

  static delete: RequestHandler = async (req, res) => {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }
    const existing = await ReviewModel.getById(parsed.data)
    if (!existing) {
      res.status(404).json({ error: 'Review not found' })
      return
    }
    await ReviewModel.delete(parsed.data)
    res.status(204).send()
  }
}
