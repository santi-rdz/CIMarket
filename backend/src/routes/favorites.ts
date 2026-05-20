import { Router, type IRouter } from 'express'
import FavoriteController from '#controllers/Favorites'
import { requireAuth } from '#middlewares/auth'

export const favoritesRouter: IRouter = Router()

favoritesRouter.get('/check/:productId', requireAuth, FavoriteController.check)
favoritesRouter.post('/', requireAuth, FavoriteController.toggle)
favoritesRouter.get('/', FavoriteController.getAll)
