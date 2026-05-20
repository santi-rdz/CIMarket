import { Router } from 'express'
import { requireAuth } from '#middlewares/auth'
import { list, markRead, markAllRead } from '#controllers/Notifications'

export const notificationsRouter = Router()

notificationsRouter.use(requireAuth)

notificationsRouter.get('/', list)
notificationsRouter.patch('/read-all', markAllRead)
notificationsRouter.patch('/:id/read', markRead)
