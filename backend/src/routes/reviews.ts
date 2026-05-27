import { Router, type IRouter } from 'express'
import ReviewController from '#controllers/Reviews'
import { requireAuth } from '#middlewares/auth'

export const reviewsRouter: IRouter = Router()

reviewsRouter.get('/', ReviewController.getAll)
reviewsRouter.get('/:id', ReviewController.getById)
reviewsRouter.post('/', requireAuth, ReviewController.create)
reviewsRouter.patch('/:id', requireAuth, ReviewController.update)
reviewsRouter.delete('/:id', requireAuth, ReviewController.delete)
