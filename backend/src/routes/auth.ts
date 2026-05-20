import { Router, type IRouter } from 'express'
import AuthController from '#controllers/Auth'
import { requireAuth } from '#middlewares/auth'

export const authRouter: IRouter = Router()

authRouter.post('/google', AuthController.google)
authRouter.get('/me', requireAuth, AuthController.me)
