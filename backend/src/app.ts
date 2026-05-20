import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
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
import { setupSocketHandlers } from '#lib/sockets'

const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://frontend:5173']

const app: express.Application = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
})

app.use(express.json())
app.use(
  cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }),
)

app.get('/', (_req, res) => {
  res.send('Hello, World!')
})
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

setupSocketHandlers(io)

httpServer.listen(8000, '0.0.0.0', () => {
  console.log('Server is running on http://localhost:8000')
})

export default app
