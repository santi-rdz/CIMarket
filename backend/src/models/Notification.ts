import { prisma } from '#config/prisma'

export default class NotificationModel {
  static async create(
    userId: string,
    data: { title: string; body: string; url: string; imageUrl?: string | null; avatarUrl?: string | null },
  ) {
    return prisma.notification.create({
      data: { userId, ...data },
      select: { id: true, type: true, title: true, body: true, url: true, imageUrl: true, avatarUrl: true, createdAt: true, readAt: true },
    })
  }

  static async listByUser(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { id: true, type: true, title: true, body: true, url: true, imageUrl: true, avatarUrl: true, createdAt: true, readAt: true },
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ])
    return { notifications, unreadCount }
  }

  static async markRead(id: number, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    })
  }

  static async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  }
}
