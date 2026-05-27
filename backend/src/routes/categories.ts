import { Router, type IRouter } from 'express'
import CategoryController from '#controllers/Categories'
import { requireAdmin, requireAuth } from '#middlewares/auth'

export const categoriesRouter: IRouter = Router()

categoriesRouter.get('/', CategoryController.getAll)
categoriesRouter.get('/:id', CategoryController.getById)
categoriesRouter.post('/', requireAuth, requireAdmin, CategoryController.create)
categoriesRouter.patch('/:id', requireAuth, requireAdmin, CategoryController.update)
categoriesRouter.delete('/:id', requireAuth, requireAdmin, CategoryController.delete)
