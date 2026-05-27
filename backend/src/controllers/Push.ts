import type { Request, Response } from 'express'
import { pushSubscribeSchema, pushUnsubscribeSchema } from '@cm/shared/schemas/push'
import { formatZodErrors } from '@cm/shared/schemas/common'
import PushSubscriptionModel from '#models/PushSubscription'
import { vapidPublicKey } from '#config/webpush'

export async function getVapidKey(_req: Request, res: Response) {
  res.json({ publicKey: vapidPublicKey })
}

export async function subscribe(req: Request, res: Response) {
  const parsed = pushSubscribeSchema.safeParse(req.body)
  if (!parsed.success) {
    res
      .status(400)
      .json({
        error: 'Invalid subscription data',
        details: formatZodErrors(parsed.error),
      })
    return
  }

  const userId = req.user!.id
  const { endpoint, keys } = parsed.data

  await PushSubscriptionModel.upsert(userId, endpoint, keys.p256dh, keys.auth)
  res.status(201).json({ subscribed: true })
}

export async function unsubscribe(req: Request, res: Response) {
  const parsed = pushUnsubscribeSchema.safeParse(req.body)
  if (!parsed.success) {
    res
      .status(400)
      .json({
        error: 'Invalid subscription data',
        details: formatZodErrors(parsed.error),
      })
    return
  }

  const userId = req.user!.id
  await PushSubscriptionModel.remove(userId, parsed.data.endpoint)
  res.json({ unsubscribed: true })
}
