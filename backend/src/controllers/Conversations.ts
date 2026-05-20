import type { RequestHandler } from 'express'
import { uuidSchema } from '@cm/shared/schemas/fields'
import ConversationModel from '#models/Conversation'
import ReportModel from '#models/Report'

export default class ConversationController {
  /** GET /conversations */
  static list: RequestHandler = async (req, res) => {
    const conversations = await ConversationModel.listByUser(req.user!.id)
    res.json(conversations)
  }

  /** POST /conversations  { sellerId, productId } */
  static create: RequestHandler = async (req, res) => {
    const sellerParsed = uuidSchema.safeParse(req.body.sellerId)
    const productParsed = uuidSchema.safeParse(req.body.productId)

    if (!sellerParsed.success || !productParsed.success) {
      res.status(400).json({ error: 'Invalid sellerId or productId' })
      return
    }

    const conversation = await ConversationModel.getOrCreate(
      req.user!.id,
      sellerParsed.data,
      productParsed.data,
    )

    if (!conversation) {
      res.status(400).json({ error: 'Cannot create conversation with yourself' })
      return
    }

    res.status(201).json(conversation)
  }

  /** GET /conversations/:id */
  static getById: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const conversation = await ConversationModel.getWithMessages(parsed.data, req.user!.id)
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    res.json(conversation)
  }

  /** PATCH /conversations/:id/archive */
  static archive: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const result = await ConversationModel.archive(parsed.data, req.user!.id)
    if (!result) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    res.json({ archived: true })
  }

  /** PATCH /conversations/:id/unarchive */
  static unarchive: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const result = await ConversationModel.unarchive(parsed.data, req.user!.id)
    if (!result) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    res.json({ archived: false })
  }

  /** DELETE /conversations/:id */
  static delete: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const result = await ConversationModel.softDelete(parsed.data, req.user!.id)
    if (!result) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    res.status(204).send()
  }

  /** POST /conversations/:id/report  { reason, detail? } */
  static report: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const { reason, detail } = req.body
    const validReasons = ['SPAM', 'ACOSO', 'FRAUDE', 'CONTENIDO_INAPROPIADO', 'OTRO']
    if (!reason || !validReasons.includes(reason)) {
      res.status(400).json({ error: 'Invalid reason' })
      return
    }

    // Find the other user in the conversation
    const conversation = await ConversationModel.getWithMessages(parsed.data, req.user!.id)
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    const reportedId = conversation.buyerId === req.user!.id ? conversation.sellerId : conversation.buyerId

    const report = await ReportModel.create(req.user!.id, reportedId, reason, detail)
    if (!report) {
      res.status(400).json({ error: 'Cannot report yourself' })
      return
    }

    res.status(201).json({ reported: true })
  }
}
