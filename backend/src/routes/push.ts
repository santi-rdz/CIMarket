import { Router } from 'express'
import { requireAuth } from '#middlewares/auth'
import { getVapidKey, subscribe, unsubscribe } from '#controllers/Push'

export const pushRouter = Router()

pushRouter.get('/vapid-key', getVapidKey)
pushRouter.post('/subscribe', requireAuth, subscribe)
pushRouter.post('/unsubscribe', requireAuth, unsubscribe)
