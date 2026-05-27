import type { RequestHandler } from 'express'
import { uuidSchema } from '@cm/shared/schemas/fields'
import {
  createTransactionSchema,
  transactionReviewSchema,
} from '@cm/shared/schemas/transaction'
import { formatZodErrors } from '@cm/shared/schemas/common'
import TransactionModel from '#models/Transaction'
import { getIo } from '#lib/io'
import { notifyUser, roomNames } from '#lib/realtime'

export default class TransactionController {
  /** POST /transactions — seller marks a product as sold to a buyer */
  static create: RequestHandler = async (req, res) => {
    const parsed = createTransactionSchema.safeParse(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const { productId, buyerId, conversationId } = parsed.data

    const sellerId = req.user!.id

    if (sellerId === buyerId) {
      res
        .status(400)
        .json({ error: 'El vendedor y el comprador no pueden ser la misma persona' })
      return
    }

    // Check the product belongs to the seller
    const { prisma } = await import('#config/prisma')
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        userId: true,
        status: true,
        title: true,
        images: { take: 1, select: { url: true } },
      },
    })

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }
    if (product.userId !== sellerId) {
      res
        .status(403)
        .json({ error: 'No tienes permiso para marcar este producto como vendido' })
      return
    }
    if (product.status === 'VENDIDO') {
      res.status(409).json({ error: 'Este producto ya fue marcado como vendido' })
      return
    }

    const existing = await TransactionModel.getByProduct(productId)
    if (existing) {
      res.status(409).json({ error: 'Ya existe una transacción para este producto' })
      return
    }

    const transaction = await TransactionModel.create(
      productId,
      sellerId,
      buyerId,
      conversationId,
    )

    const productThumb = product.images[0]?.url ?? null
    const reviewUrl = `/?reviewId=${transaction.id}`

    const io = getIo()

    // Notify buyer: rate the seller
    await notifyUser(
      io,
      buyerId,
      {
        type: 'SALE_REVIEW',
        title: '¡Califica tu compra!',
        body: `¿Cómo fue tu experiencia comprando "${product.title}"?`,
        url: reviewUrl,
        imageUrl: productThumb,
        avatarUrl: transaction.seller.photoUrl,
      },
      { push: true },
    )
    io.to(roomNames.user(buyerId)).emit('sale_review_pending', {
      transactionId: transaction.id,
      productTitle: product.title,
      productThumb,
      sellerName: transaction.seller.name,
    })

    // Notify seller: rate the buyer
    await notifyUser(
      io,
      sellerId,
      {
        type: 'SALE_REVIEW',
        title: '¡Califica al comprador!',
        body: `¿Cómo fue tu experiencia vendiendo "${product.title}"?`,
        url: reviewUrl, // same transactionId — the modal resolves the correct reviewee per user
        imageUrl: productThumb,
        avatarUrl: transaction.buyer.photoUrl,
      },
      { push: true },
    )
    io.to(roomNames.user(sellerId)).emit('sale_review_pending', {
      transactionId: transaction.id,
      productTitle: product.title,
      productThumb,
      sellerName: transaction.buyer.name,
    })

    res.status(201).json(transaction)
  }

  /** GET /transactions/pending-reviews — reviews the current user still needs to write */
  static pendingReviews: RequestHandler = async (req, res) => {
    const reviews = await TransactionModel.getPendingReviewsForUser(req.user!.id)
    res.json(reviews)
  }

  /** GET /transactions/:id */
  static getById: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid transaction ID' })
      return
    }
    const transaction = await TransactionModel.getById(parsed.data)
    if (!transaction) {
      res.status(404).json({ error: 'Transacción no encontrada' })
      return
    }
    const ok = await TransactionModel.hasAccess(parsed.data, req.user!.id)
    if (!ok) {
      res.status(403).json({ error: 'No tienes acceso a esta transacción' })
      return
    }
    res.json(transaction)
  }

  /** GET /transactions/product/:productId */
  static getByProduct: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.productId)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const transaction = await TransactionModel.getByProduct(parsed.data)
    if (!transaction) {
      res.status(404).json({ error: 'No hay transacción para este producto' })
      return
    }
    const ok = await TransactionModel.hasAccess(transaction.id, req.user!.id)
    if (!ok) {
      res.status(403).json({ error: 'No tienes acceso a esta transacción' })
      return
    }
    res.json(transaction)
  }

  /** POST /transactions/:id/reviews */
  static submitReview: RequestHandler = async (req, res) => {
    const parsed = uuidSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid transaction ID' })
      return
    }

    const bodyParsed = transactionReviewSchema.safeParse(req.body)
    if (!bodyParsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(bodyParsed.error) })
      return
    }
    const { rating, comment } = bodyParsed.data

    const transaction = await TransactionModel.getById(parsed.data)
    if (!transaction) {
      res.status(404).json({ error: 'Transacción no encontrada' })
      return
    }

    const fromId = req.user!.id
    const isSeller = transaction.seller.id === fromId
    const isBuyer = transaction.buyer.id === fromId

    if (!isSeller && !isBuyer) {
      res.status(403).json({ error: 'No eres parte de esta transacción' })
      return
    }

    const already = await TransactionModel.hasReviewed(parsed.data, fromId)
    if (already) {
      res.status(409).json({ error: 'Ya dejaste una reseña para esta transacción' })
      return
    }

    const toId = isSeller ? transaction.buyer.id : transaction.seller.id
    const review = await TransactionModel.submitReview(
      parsed.data,
      fromId,
      toId,
      rating,
      typeof comment === 'string' ? comment : undefined,
    )

    res.status(201).json(review)
  }
}
