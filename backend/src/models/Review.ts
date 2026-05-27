import type { ReviewInput, ReviewsQuery } from '#types/types'
import { prisma } from '#config/prisma'

export default class ReviewModel {
  static async getAll({ sellerId, reviewerId, page = 1, limit = 10 }: ReviewsQuery) {
    const where: Record<string, unknown> = {}
    if (sellerId) where.sellerId = sellerId
    if (reviewerId) where.reviewerId = reviewerId

    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: { select: { id: true, name: true, photoUrl: true } },
          seller: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: number) {
    return prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        seller: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, photoUrl: true } },
      },
    })
  }

  static async existsByReviewerAndSeller(reviewerId: string, sellerId: string) {
    return prisma.review.findUnique({
      where: { reviewerId_sellerId: { reviewerId, sellerId } },
    })
  }

  static async create(data: ReviewInput) {
    return prisma.review.create({
      data,
      include: { reviewer: { select: { id: true, name: true } } },
    })
  }

  static async update(
    id: number,
    data: Partial<Pick<ReviewInput, 'rating' | 'comment'>>,
  ) {
    return prisma.review.update({ where: { id }, data })
  }

  static async delete(id: number) {
    return prisma.review.delete({ where: { id } })
  }
}
