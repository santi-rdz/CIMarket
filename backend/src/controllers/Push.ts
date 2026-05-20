import type { Request, Response } from 'express'
import { pushSubscribeSchema } from '@cm/shared/schemas/push'
import PushSubscriptionModel from '#models/PushSubscription'
import { vapidPublicKey } from '#config/webpush'

export async function getVapidKey(_req: Request, res: Response) {
  res.json({ publicKey: vapidPublicKey })
}

export async function subscribe(req: Request, res: Response) {
  const parsed = pushSubscribeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid subscription data' })
    return
  }

  const userId = req.user!.sub
  const { endpoint, keys } = parsed.data

  await PushSubscriptionModel.upsert(userId, endpoint, keys.p256dh, keys.auth)
  res.status(201).json({ subscribed: true })
}

export async function unsubscribe(req: Request, res: Response) {
  const { endpoint } = req.body as { endpoint?: string }
  if (!endpoint) {
    res.status(400).json({ error: 'endpoint required' })
    return
  }

  const userId = req.user!.sub
  await PushSubscriptionModel.remove(userId, endpoint)
  res.json({ unsubscribed: true })
}
