import { Router, type IRouter } from 'express'
import { requireAuth } from '#middlewares/auth'
import { getVapidKey, subscribe, unsubscribe } from '#controllers/Push'

export const pushRouter: IRouter = Router()

pushRouter.get('/vapid-key', getVapidKey)
pushRouter.post('/subscribe', requireAuth, subscribe)
pushRouter.post('/unsubscribe', requireAuth, unsubscribe)
