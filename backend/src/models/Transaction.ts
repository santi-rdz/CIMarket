import { prisma } from '#config/prisma'

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  from: { select: { id: true, name: true, photoUrl: true } },
  to:   { select: { id: true, name: true } },
} as const

const transactionSelect = {
  id: true,
  createdAt: true,
  conversationId: true,
  product: { select: { id: true, title: true, slug: true, images: { take: 1, select: { url: true } } } },
  seller: { select: { id: true, name: true, photoUrl: true } },
  buyer:  { select: { id: true, name: true, photoUrl: true } },
  reviews: { select: reviewSelect },
} as const

export default class TransactionModel {
  /** Create transaction + mark product as VENDIDO + archive conversation for both parties */
  static async create(productId: string, sellerId: string, buyerId: string, conversationId?: string) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: { productId, sellerId, buyerId, conversationId },
        select: transactionSelect,
      })
      await tx.product.update({
        where: { id: productId },
        data: { status: 'VENDIDO' },
      })
      if (conversationId) {
        const now = new Date()
        await tx.conversation.update({
          where: { id: conversationId },
          data: { buyerArchivedAt: now, sellerArchivedAt: now },
        })
      }
      return transaction
    })
  }

  static async getById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      select: transactionSelect,
    })
  }

  static async getByProduct(productId: string) {
    return prisma.transaction.findUnique({
      where: { productId },
      select: transactionSelect,
    })
  }

  /** Returns all transactions where the user is seller or buyer and has NOT left a review yet */
  static async getPendingReviewsForUser(userId: string) {
    return prisma.transaction.findMany({
      where: {
        OR: [{ sellerId: userId }, { buyerId: userId }],
        reviews: { none: { fromId: userId } },
      },
      select: transactionSelect,
    })
  }

  static async submitReview(
    transactionId: string,
    fromId: string,
    toId: string,
    rating: number,
    comment?: string,
  ) {
    return prisma.transactionReview.create({
      data: { transactionId, fromId, toId, rating, comment },
      select: reviewSelect,
    })
  }

  static async hasAccess(id: string, userId: string) {
    const t = await prisma.transaction.findUnique({
      where: { id },
      select: { sellerId: true, buyerId: true },
    })
    return t && (t.sellerId === userId || t.buyerId === userId)
  }

  static async hasReviewed(transactionId: string, fromId: string) {
    return prisma.transactionReview.findUnique({
      where: { transactionId_fromId: { transactionId, fromId } },
    })
  }
}
