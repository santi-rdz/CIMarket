import { Router, type IRouter } from 'express'
import UserController from '#controllers/Users'
import { requireAuth, optionalAuth } from '#middlewares/auth'

export const usersRouter: IRouter = Router()

usersRouter.get('/', UserController.getAll)
usersRouter.post('/', UserController.create)

// All /:id routes use optionalAuth so the controller knows if caller is the owner
usersRouter.get('/:id', optionalAuth, UserController.getById)
usersRouter.patch('/:id', requireAuth, UserController.update)
usersRouter.delete('/:id', requireAuth, UserController.delete)
usersRouter.get('/:id/products', optionalAuth, UserController.getProducts)
usersRouter.get('/:id/favorites', requireAuth, UserController.getFavorites)
usersRouter.get('/:id/reviews', UserController.getReviews)
usersRouter.get('/:id/preferences', requireAuth, UserController.getPreferences)
usersRouter.put('/:id/preferences', requireAuth, UserController.updatePreferences)
