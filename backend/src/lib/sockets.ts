import { Server, type Socket } from 'socket.io'
import { verifyToken } from '#config/auth'
import ConversationModel from '#models/Conversation'
import { ConversationMessageService } from '#lib/conversationMessages'
import { roomNames } from '#lib/realtime'

// ─── Event type contracts ────────────────────────────────────────────────────

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void
  leave_conversation: (conversationId: string) => void
  send_message: (
    data: { conversationId: string; content: string; replyToId?: string },
    ack?: (response: SendMessageAck) => void,
  ) => void
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
    replyTo: { id: string; content: string; sender: { id: string; name: string } } | null
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
  sale_review_pending: (data: {
    transactionId: string
    productTitle: string
    productThumb: string | null
    sellerName: string
  }) => void
  error: (message: string) => void
}

type SendMessageAck =
  | {
      ok: true
      message: Parameters<ServerToClientEvents['new_message']>[0]
    }
  | { ok: false; error: string }

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
    if (!token) return next(new Error('Inicia sesión para continuar'))

    try {
      const payload = await verifyToken(token)
      socket.data.userId = payload.sub
      socket.data.email = payload.email
      socket.data.rol = payload.rol
      next()
    } catch {
      next(new Error('Tu sesión expiró. Vuelve a iniciar sesión'))
    }
  })

  io.on('connection', (socket: TypedSocket) => {
    const { userId } = socket.data

    // Personal room — used for cross-conversation notifications
    socket.join(roomNames.user(userId))

    socket.on('join_conversation', async (conversationId) => {
      const hasAccess = await ConversationModel.hasAccess(conversationId, userId)
      if (!hasAccess) {
        socket.emit('error', 'Conversación no encontrada o sin permiso')
        return
      }
      socket.join(roomNames.conversation(conversationId))
    })

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(roomNames.conversation(conversationId))
    })

    socket.on('send_message', async ({ conversationId, content, replyToId }, ack) => {
      if (!content?.trim()) {
        ack?.({ ok: false, error: 'El mensaje no puede estar vacío' })
        socket.emit('error', 'El mensaje no puede estar vacío')
        return
      }

      const message = await ConversationMessageService.send(io, {
        conversationId,
        senderId: userId,
        content,
        replyToId,
      })
      if (!message) {
        const error = 'No se pudo enviar el mensaje en esta conversación'
        ack?.({ ok: false, error })
        socket.emit('error', error)
        return
      }

      ack?.({ ok: true, message })
    })

    socket.on('mark_as_read', async (conversationId) => {
      const readAt = await ConversationModel.markAsRead(conversationId, userId)
      if (!readAt) return

      // Notify others in the conversation (not the reader themselves)
      socket.to(roomNames.conversation(conversationId)).emit('messages_read', {
        conversationId,
        readAt,
      })
    })

    socket.on('typing', async ({ conversationId, isTyping }) => {
      if (!socket.rooms.has(roomNames.conversation(conversationId))) {
        const hasAccess = await ConversationModel.hasAccess(conversationId, userId)
        if (!hasAccess) return
      }

      socket.to(roomNames.conversation(conversationId)).emit('user_typing', {
        userId,
        conversationId,
        isTyping,
      })
    })
  })
}
