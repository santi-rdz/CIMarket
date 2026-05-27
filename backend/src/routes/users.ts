import { Router, type IRouter } from 'express'
import UserController from '#controllers/Users'
import { requireAuth, requireAdmin, optionalAuth } from '#middlewares/auth'

export const usersRouter: IRouter = Router()

// Admin-only: list all users (includes emails) and direct user creation (bypasses OAuth)
usersRouter.get('/', requireAdmin, UserController.getAll)
usersRouter.post('/', requireAdmin, UserController.create)

// All /:id routes use optionalAuth so the controller knows if caller is the owner
usersRouter.get('/:id', optionalAuth, UserController.getById)
usersRouter.patch('/:id', requireAuth, UserController.update)
usersRouter.delete('/:id', requireAuth, UserController.delete)
usersRouter.get('/:id/products', optionalAuth, UserController.getProducts)
usersRouter.get('/:id/favorites', requireAuth, UserController.getFavorites)
usersRouter.get('/:id/reviews', UserController.getReviews)
usersRouter.get('/:id/preferences', requireAuth, UserController.getPreferences)
usersRouter.put('/:id/preferences', requireAuth, UserController.updatePreferences)
