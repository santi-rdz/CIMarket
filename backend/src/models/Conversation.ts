import { prisma } from '#config/prisma'

const userSelect = { id: true, name: true, photoUrl: true } as const
const replyToSelect = {
  id: true,
  content: true,
  sender: { select: { id: true, name: true } },
} as const
const productPreview = {
  id: true,
  title: true,
  slug: true,
  price: true,
  status: true,
  images: { select: { url: true }, take: 1 },
} as const

export default class ConversationModel {
  /** Check if a user belongs to a conversation */
  static async hasAccess(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    })
    if (!conv) return false
    return conv.buyerId === userId || conv.sellerId === userId
  }

  /** List all conversations for a user — excludes deleted ones */
  static async listByUser(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId, buyerDeletedAt: null },
          { sellerId: userId, sellerDeletedAt: null },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        buyerId: true,
        sellerId: true,
        buyerArchivedAt: true,
        sellerArchivedAt: true,
        buyer: { select: userSelect },
        seller: { select: userSelect },
        product: { select: productPreview },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true, senderId: true },
        },
        _count: {
          select: {
            messages: { where: { readAt: null, senderId: { not: userId } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  /** Get or create a conversation — enforces unique buyer+seller+product */
  static async getOrCreate(buyerId: string, sellerId: string, productId: string) {
    if (buyerId === sellerId) return null

    const existing = await prisma.conversation.findUnique({
      where: { buyerId_sellerId_productId: { buyerId, sellerId, productId } },
    })

    if (existing) {
      // Un-delete if the user had previously deleted it
      if (existing.buyerDeletedAt && existing.buyerId === buyerId) {
        await prisma.conversation.update({
          where: { id: existing.id },
          data: { buyerDeletedAt: null, buyerArchivedAt: null },
        })
      }
      if (existing.sellerDeletedAt && existing.sellerId === buyerId) {
        await prisma.conversation.update({
          where: { id: existing.id },
          data: { sellerDeletedAt: null, sellerArchivedAt: null },
        })
      }
      return existing
    }

    return prisma.conversation.create({
      data: { buyerId, sellerId, productId },
    })
  }

  /** Get conversation with messages */
  static async getWithMessages(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        createdAt: true,
        buyerId: true,
        sellerId: true,
        buyerArchivedAt: true,
        sellerArchivedAt: true,
        buyer: { select: { ...userSelect, email: true } },
        seller: { select: { ...userSelect, email: true } },
        product: { select: { ...productPreview, description: true } },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            readAt: true,
            senderId: true,
            sender: { select: userSelect },
            replyTo: { select: replyToSelect },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!conversation) return null

    const isBuyer = conversation.buyerId === userId
    const isSeller = conversation.sellerId === userId
    if (!isBuyer && !isSeller) return null

    return conversation
  }

  /** Persist a message and return it formatted for broadcast */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    replyToId?: string,
  ) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        buyerId: true,
        sellerId: true,
        product: { select: { images: { select: { url: true }, take: 1 } } },
      },
    })
    if (!conv) return null
    if (conv.buyerId !== senderId && conv.sellerId !== senderId) return null

    const recipientId = conv.buyerId === senderId ? conv.sellerId : conv.buyerId
    if (!recipientId || recipientId === senderId) return null // Prevent self-notifications
    const productThumb = conv.product.images[0]?.url ?? null

    if (replyToId) {
      const reply = await prisma.message.findFirst({
        where: { id: replyToId, conversationId },
        select: { id: true },
      })
      if (!reply) return null
    }

    const message = await prisma.message.create({
      data: { content, senderId, conversationId, replyToId: replyToId ?? null },
      select: {
        id: true,
        content: true,
        senderId: true,
        conversationId: true,
        createdAt: true,
        sender: { select: userSelect },
        replyTo: { select: replyToSelect },
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return { ...message, recipientId, productThumb }
  }

  /** Mark all unread messages in a conversation as read */
  static async markAsRead(conversationId: string, userId: string) {
    const hasAccess = await this.hasAccess(conversationId, userId)
    if (!hasAccess) return null

    const now = new Date()
    await prisma.message.updateMany({
      where: { conversationId, readAt: null, senderId: { not: userId } },
      data: { readAt: now },
    })

    return now
  }

  /** Archive a conversation for a specific user */
  static async archive(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    })
    if (!conv) return null

    const field =
      conv.buyerId === userId
        ? 'buyerArchivedAt'
        : conv.sellerId === userId
          ? 'sellerArchivedAt'
          : null
    if (!field) return null

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { [field]: new Date() },
    })
  }

  /** Unarchive a conversation for a specific user */
  static async unarchive(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    })
    if (!conv) return null

    const field =
      conv.buyerId === userId
        ? 'buyerArchivedAt'
        : conv.sellerId === userId
          ? 'sellerArchivedAt'
          : null
    if (!field) return null

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { [field]: null },
    })
  }

  /** Soft-delete a conversation for a specific user */
  static async softDelete(conversationId: string, userId: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    })
    if (!conv) return null

    const field =
      conv.buyerId === userId
        ? 'buyerDeletedAt'
        : conv.sellerId === userId
          ? 'sellerDeletedAt'
          : null
    if (!field) return null

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { [field]: new Date() },
    })
  }
}
