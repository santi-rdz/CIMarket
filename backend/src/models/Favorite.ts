import type { FavoritesQuery } from '#types/types'
import { prisma } from '#config/prisma'

export default class FavoriteModel {
  static async getByUser({ userId, page = 1, limit = 10 }: FavoritesQuery) {
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId

    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: { select: { url: true }, take: 1 },
            },
          },
        },
      }),
      prisma.favorite.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async exists(userId: string, productId: string) {
    return prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    })
  }

  static async toggle(userId: string, productId: string) {
    const existing = await this.exists(userId, productId)
    if (existing) {
      await prisma.favorite.delete({
        where: { userId_productId: { userId, productId } },
      })
      return { favorited: false }
    }
    await prisma.favorite.create({ data: { userId, productId } })
    return { favorited: true }
  }
}
