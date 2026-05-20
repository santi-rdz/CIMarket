import { Router, type IRouter } from 'express'
import CategoryController from '#controllers/Categories'

export const categoriesRouter: IRouter = Router()

categoriesRouter.get('/', CategoryController.getAll)
categoriesRouter.get('/:id', CategoryController.getById)
categoriesRouter.post('/', CategoryController.create)
categoriesRouter.patch('/:id', CategoryController.update)
categoriesRouter.delete('/:id', CategoryController.delete)
