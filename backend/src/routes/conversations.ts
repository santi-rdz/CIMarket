import { Router, type IRouter } from 'express'
import ConversationController from '#controllers/Conversations'
import { requireAuth } from '#middlewares/auth'

export const conversationsRouter: IRouter = Router()

conversationsRouter.use(requireAuth)
conversationsRouter.get('/', ConversationController.list)
conversationsRouter.post('/', ConversationController.create)
conversationsRouter.get('/:id', ConversationController.getById)
conversationsRouter.patch('/:id/archive', ConversationController.archive)
conversationsRouter.patch('/:id/unarchive', ConversationController.unarchive)
conversationsRouter.delete('/:id', ConversationController.delete)
conversationsRouter.post('/:id/report', ConversationController.report)
