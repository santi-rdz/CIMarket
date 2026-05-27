import { Router, type IRouter } from 'express'
import TransactionController from '#controllers/Transactions'
import { requireAuth } from '#middlewares/auth'

export const transactionsRouter: IRouter = Router()

transactionsRouter.use(requireAuth)
transactionsRouter.post('/', TransactionController.create)
transactionsRouter.get('/pending-reviews', TransactionController.pendingReviews)
transactionsRouter.get('/product/:productId', TransactionController.getByProduct)
transactionsRouter.get('/:id', TransactionController.getById)
transactionsRouter.post('/:id/reviews', TransactionController.submitReview)
