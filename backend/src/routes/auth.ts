import { Router, type IRouter } from 'express'
import AuthController from '#controllers/Auth'
import { requireAuth } from '#middlewares/auth'
import { authRateLimiter } from '#lib/security'

export const authRouter: IRouter = Router()

authRouter.post('/google', authRateLimiter, AuthController.google)
authRouter.get('/me', requireAuth, AuthController.me)
authRouter.post('/refresh', authRateLimiter, AuthController.refresh)
authRouter.post('/logout', AuthController.logout)
