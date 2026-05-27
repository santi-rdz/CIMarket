import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { serverConfig } from '#config/env'
import { authRouter } from '#routes/auth'
import { usersRouter } from '#routes/users'
import { productsRouter } from '#routes/products'
import { reviewsRouter } from '#routes/reviews'
import { favoritesRouter } from '#routes/favorites'
import { categoriesRouter } from '#routes/categories'
import { campusesRouter } from '#routes/campuses'
import { conversationsRouter } from '#routes/conversations'
import { pushRouter } from '#routes/push'
import { notificationsRouter } from '#routes/notifications'
import { transactionsRouter } from '#routes/transactions'
import { docsRouter } from '#routes/docs'
import { setupSocketHandlers } from '#lib/sockets'
import { setIo } from '#lib/io'
import { apiErrorHandler, normalizeErrorResponses, notFoundHandler } from '#lib/apiErrors'
import {
  apiRateLimiter,
  corsOptions,
  securityHeaders,
  socketCorsOptions,
} from '#lib/security'

const app: express.Application = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: socketCorsOptions,
})

app.disable('x-powered-by')
if (serverConfig.trustProxy) app.set('trust proxy', 1)
app.use(normalizeErrorResponses)
app.use(securityHeaders)
app.use(cors(corsOptions))
app.use(apiRateLimiter)
app.use(express.json({ limit: serverConfig.jsonBodyLimit }))

app.get('/', (_req, res) => {
  res.send('Hello, World!')
})
app.use('/', docsRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/products', productsRouter)
app.use('/reviews', reviewsRouter)
app.use('/favorites', favoritesRouter)
app.use('/categories', categoriesRouter)
app.use('/campuses', campusesRouter)
app.use('/conversations', conversationsRouter)
app.use('/push', pushRouter)
app.use('/notifications', notificationsRouter)
app.use('/transactions', transactionsRouter)

app.use(notFoundHandler)
app.use(apiErrorHandler)

setIo(io)
setupSocketHandlers(io)

httpServer.listen(serverConfig.port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${serverConfig.port}`)
})

export default app
