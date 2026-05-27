import type { Server } from 'socket.io'
import ConversationModel from '#models/Conversation'
import { isUserViewingConversation, notifyUser, roomNames } from '#lib/realtime'

type SendConversationMessageInput = {
  conversationId: string
  senderId: string
  content: string
  replyToId?: string
}

export class ConversationMessageService {
  static async send(
    io: Server,
    { conversationId, senderId, content, replyToId }: SendConversationMessageInput,
  ) {
    const message = await ConversationModel.sendMessage(
      conversationId,
      senderId,
      content.trim(),
      replyToId,
    )
    if (!message) return null

    const { recipientId, productThumb, ...messagePayload } = message
    io.to(roomNames.conversation(conversationId)).emit('new_message', messagePayload)

    if (recipientId !== senderId) {
      const recipientInConversation = await isUserViewingConversation(
        io,
        recipientId,
        conversationId,
      )

      if (!recipientInConversation) {
        await notifyUser(
          io,
          recipientId,
          {
            title: message.sender.name,
            body: message.content,
            url: `/mensajes?chat=${conversationId}`,
            imageUrl: productThumb,
            avatarUrl: message.sender.photoUrl,
          },
          { push: true },
        )
      }
    }

    return messagePayload
  }
}
