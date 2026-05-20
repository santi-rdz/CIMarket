import type { Request, Response } from 'express'
import { idSchema } from '@cm/shared/schemas/fields'
import NotificationModel from '#models/Notification'

export async function list(req: Request, res: Response) {
  const userId = req.user!.id
  const result = await NotificationModel.listByUser(userId)
  res.json(result)
}

export async function markRead(req: Request, res: Response) {
  const parsed = idSchema.safeParse(req.params.id)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid id' })
    return
  }

  const userId = req.user!.id
  await NotificationModel.markRead(parsed.data, userId)
  res.json({ ok: true })
}

export async function markAllRead(req: Request, res: Response) {
  const userId = req.user!.id
  const result = await NotificationModel.markAllRead(userId)
  res.json({ updated: result.count })
}
