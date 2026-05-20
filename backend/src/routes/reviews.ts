import { Router, type IRouter } from 'express'
import ReviewController from '#controllers/Reviews'

export const reviewsRouter: IRouter = Router()

reviewsRouter.get('/', ReviewController.getAll)
reviewsRouter.get('/:id', ReviewController.getById)
reviewsRouter.post('/', ReviewController.create)
reviewsRouter.patch('/:id', ReviewController.update)
reviewsRouter.delete('/:id', ReviewController.delete)
