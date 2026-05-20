import { Server, type Socket } from 'socket.io'
import { verifyToken } from '#config/auth'
import ConversationModel from '#models/Conversation'
import PushSubscriptionModel from '#models/PushSubscription'
import NotificationModel from '#models/Notification'

// ─── Event type contracts ────────────────────────────────────────────────────

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void
  leave_conversation: (conversationId: string) => void
  send_message: (data: { conversationId: string; content: string }) => void
  mark_as_read: (conversationId: string) => void
  typing: (data: { conversationId: string; isTyping: boolean }) => void
}

interface ServerToClientEvents {
  new_message: (message: {
    id: string
    content: string
    senderId: string
    sender: { id: string; name: string; photoUrl: string | null }
    conversationId: string
    createdAt: Date
  }) => void
  messages_read: (data: { conversationId: string; readAt: Date }) => void
  user_typing: (data: {
    userId: string
    conversationId: string
    isTyping: boolean
  }) => void
  notification: (data: {
    id: number
    type: string
    title: string
    body: string
    url: string
    createdAt: Date
  }) => void
  error: (message: string) => void
}

interface SocketData {
  userId: string
  email: string
  rol: string
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>

// ─── Setup ───────────────────────────────────────────────────────────────────

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>,
) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    if (!token) return next(new Error('Missing authentication token'))

    try {
      const payload = await verifyToken(token)
      socket.data.userId = payload.sub
      socket.data.email = payload.email
      socket.data.rol = payload.rol
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket: TypedSocket) => {
    const { userId } = socket.data

    // Personal room — used for cross-conversation notifications
    socket.join(`user:${userId}`)

    socket.on('join_conversation', async (conversationId) => {
      const hasAccess = await ConversationModel.hasAccess(conversationId, userId)
      if (!hasAccess) {
        socket.emit('error', 'Conversation not found or unauthorized')
        return
      }
      socket.join(`conversation:${conversationId}`)
    })

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`)
    })

    socket.on('send_message', async ({ conversationId, content }) => {
      if (!content?.trim()) {
        socket.emit('error', 'Message content cannot be empty')
        return
      }

      const message = await ConversationModel.sendMessage(conversationId, userId, content)
      if (!message) {
        socket.emit('error', 'Failed to send message')
        return
      }

      const { recipientId, productThumb, ...messagePayload } = message
      io.to(`conversation:${conversationId}`).emit('new_message', messagePayload)

      // Never notify yourself
      if (recipientId === userId) return

      // Notify recipient if they are not actively viewing this conversation
      const convRoom = io.sockets.adapter.rooms.get(`conversation:${conversationId}`)
      const recipientSockets = await io.in(`user:${recipientId}`).fetchSockets()
      const recipientInConv = recipientSockets.some((s) => convRoom?.has(s.id))

      if (!recipientInConv) {
        const notifPayload = {
          title: message.sender.name,
          body: message.content,
          url: `/mensajes?chat=${conversationId}`,
          imageUrl: productThumb,
          avatarUrl: message.sender.photoUrl,
        }

        // Persist notification and emit via socket
        const notif = await NotificationModel.create(recipientId, notifPayload)
        io.to(`user:${recipientId}`).emit('notification', notif)

        // Also attempt web push (best-effort, works in production with HTTPS)
        PushSubscriptionModel.sendToUser(recipientId, notifPayload)
      }
    })

    socket.on('mark_as_read', async (conversationId) => {
      const readAt = await ConversationModel.markAsRead(conversationId, userId)
      if (!readAt) return

      // Notify others in the conversation (not the reader themselves)
      socket.to(`conversation:${conversationId}`).emit('messages_read', {
        conversationId,
        readAt,
      })
    })

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping,
      })
    })
  })
}
