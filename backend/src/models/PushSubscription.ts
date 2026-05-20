import { prisma } from '#config/prisma'
import { webpush, pushEnabled } from '#config/webpush'

export default class PushSubscriptionModel {
  static async upsert(userId: string, endpoint: string, p256dh: string, auth: string) {
    return prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint } },
      create: { userId, endpoint, p256dh, auth },
      update: { p256dh, auth },
    })
  }

  static async remove(userId: string, endpoint: string) {
    return prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    })
  }

  static async sendToUser(
    userId: string,
    payload: { title: string; body: string; url: string },
  ) {
    if (!pushEnabled) return

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        ),
      ),
    )

    // Clean up expired/invalid subscriptions
    const expired: string[] = []
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const err = result.reason as { statusCode?: number }
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          expired.push(subscriptions[i].endpoint)
        }
      }
    })

    if (expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { userId, endpoint: { in: expired } },
      })
    }
  }
}
