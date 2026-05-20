export type NotificationType = 'MESSAGE'

export type AppNotification = {
  id: number
  type: NotificationType
  title: string
  body: string
  url: string
  imageUrl: string | null
  avatarUrl: string | null
  readAt: string | null
  createdAt: string
}

export type NotificationsResponse = {
  notifications: AppNotification[]
  unreadCount: number
}
