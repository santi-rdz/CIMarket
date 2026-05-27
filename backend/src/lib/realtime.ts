import type { Server } from 'socket.io'
import NotificationModel from '#models/Notification'
import PushSubscriptionModel from '#models/PushSubscription'

export const roomNames = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
}

type NotificationPayload = {
  type?: 'MESSAGE' | 'SALE_REVIEW'
  title: string
  body: string
  url: string
  imageUrl?: string | null
  avatarUrl?: string | null
}

export async function isUserViewingConversation(
  io: Server,
  userId: string,
  conversationId: string,
) {
  const conversationRoom = io.sockets.adapter.rooms.get(
    roomNames.conversation(conversationId),
  )
  const userSockets = await io.in(roomNames.user(userId)).fetchSockets()
  return userSockets.some((socket) => conversationRoom?.has(socket.id))
}

export async function notifyUser(
  io: Server,
  userId: string,
  payload: NotificationPayload,
  options: { push?: boolean } = {},
) {
  const notification = await NotificationModel.create(userId, payload)
  io.to(roomNames.user(userId)).emit('notification', notification)

  if (options.push) {
    PushSubscriptionModel.sendToUser(userId, payload)
  }

  return notification
}
