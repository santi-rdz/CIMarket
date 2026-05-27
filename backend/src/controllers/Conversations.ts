import type { RequestHandler } from 'express'
import { uuidSchema } from '@cm/shared/schemas/fields'
import {
  createConversationSchema,
  reportConversationSchema,
  sendMessageSchema,
} from '@cm/shared/schemas/conversation'
import { formatZodErrors } from '@cm/shared/schemas/common'
import ConversationModel from '#models/Conversation'
import ReportModel from '#models/Report'
import { getIo } from '#lib/io'
import { ConversationMessageService } from '#lib/conversationMessages'

export default class ConversationController {
  /** GET /conversations */
  static list: RequestHandler = async (req, res) => {
    const conversations = await ConversationModel.listByUser(req.user!.id)
    res.json(conversations)
  }

  /** POST /conversations  { sellerId, productId } */
  static create: RequestHandler = async (req, res) => {
    const parsed = createConversationSchema.safeParse(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const { sellerId, productId } = parsed.data

    const conversation = await ConversationModel.getOrCreate(
      req.user!.id,
      sellerId,
      productId,
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

    const conversation = await ConversationModel.getWithMessages(
      parsed.data,
      req.user!.id,
    )
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

  /** POST /conversations/:id/messages  { content } */
  static sendMessage: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const bodyParsed = sendMessageSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const { content, replyToId } = bodyParsed.data

    const message = await ConversationMessageService.send(getIo(), {
      conversationId: parsed.data,
      senderId: req.user!.id,
      content,
      replyToId,
    })
    if (!message) {
      res.status(403).json({ error: 'Conversation not found or unauthorized' })
      return
    }

    res.status(201).json(message)
  }

  /** POST /conversations/:id/report  { reason, detail? } */
  static report: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid conversation ID' })
      return
    }

    const bodyParsed = reportConversationSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const { reason, detail } = bodyParsed.data

    // Find the other user in the conversation
    const conversation = await ConversationModel.getWithMessages(
      parsed.data,
      req.user!.id,
    )
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' })
      return
    }

    const reportedId =
      conversation.buyerId === req.user!.id ? conversation.sellerId : conversation.buyerId

    const report = await ReportModel.create(
      req.user!.id,
      reportedId,
      reason,
      detail ?? undefined,
    )
    if (!report) {
      res.status(400).json({ error: 'Cannot report yourself' })
      return
    }

    res.status(201).json({ reported: true })
  }
}
