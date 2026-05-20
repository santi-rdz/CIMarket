import { Router, type IRouter } from 'express'
import ProductController from '#controllers/Products'
import { requireAuth } from '#middlewares/auth'

export const productsRouter: IRouter = Router()

productsRouter.get('/', ProductController.getAll)
productsRouter.get('/:id', ProductController.getById)
productsRouter.post('/', requireAuth, ProductController.create)
productsRouter.patch('/:id', requireAuth, ProductController.update)
productsRouter.delete('/:id', requireAuth, ProductController.delete)
