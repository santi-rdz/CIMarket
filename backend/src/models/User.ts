import type { UserInput, UsersQuery } from '#types/types'
import { prisma } from '#config/prisma'

export default class UserModel {
  static async getAll({ status, rol, sortBy, search, page = 1, limit = 10 }: UsersQuery) {
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [{ name: { contains: search } }, { email: { contains: search } }]
    }
    if (status) {
      const statuses = status.split(',').map((s) => s.trim().toUpperCase())
      where.status = { in: statuses }
    }
    if (rol) {
      const roles = rol.split(',').map((r) => r.trim().toUpperCase())
      where.rol = { in: roles }
    }

    const offset = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: sortBy ? { [sortBy]: 'asc' } : { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
          rol: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async getById(id: string) {
    const [user, ratingAgg] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          googleId: true,
          name: true,
          email: true,
          photoUrl: true,
          rol: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { products: true, favorites: true, reviewsReceived: true } },
        },
      }),
      prisma.transactionReview.aggregate({
        where: { toId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])
    if (!user) return null
    const { reviewsReceived, ...restCount } = user._count
    return {
      ...user,
      _count: { ...restCount, sellerReviews: reviewsReceived },
      rating: {
        average: ratingAgg._avg.rating ? Number(ratingAgg._avg.rating) : 0,
        count: ratingAgg._count.rating,
      },
    }
  }

  static async getPublicProfile(id: string) {
    const [user, ratingAgg] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          photoUrl: true,
          createdAt: true,
          _count: { select: { products: true, reviewsReceived: true } },
        },
      }),
      prisma.transactionReview.aggregate({
        where: { toId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])
    if (!user) return null
    const { reviewsReceived, ...restCount } = user._count
    return {
      ...user,
      _count: { ...restCount, sellerReviews: reviewsReceived },
      rating: {
        average: ratingAgg._avg.rating ? Number(ratingAgg._avg.rating) : 0,
        count: ratingAgg._count.rating,
      },
    }
  }

  static async getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  static async getByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } })
  }

  static async upsertByGoogleId(googleId: string, data: Omit<UserInput, 'googleId' | 'rol' | 'status'>) {
    const existingByGoogleId = await prisma.user.findUnique({ where: { googleId } })
    if (existingByGoogleId) {
      const user = await prisma.user.update({
        where: { id: existingByGoogleId.id },
        data: { photoUrl: data.photoUrl },
      })
      return { ...user, isNewUser: false }
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingByEmail) {
      const user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId, photoUrl: data.photoUrl },
      })
      return { ...user, isNewUser: false }
    }

    const user = await prisma.user.create({ data: { googleId, ...data } })
    return { ...user, isNewUser: true }
  }

  static async create(data: UserInput) {
    return prisma.user.create({ data })
  }

  static async update(id: string, data: Partial<UserInput>) {
    return prisma.user.update({ where: { id }, data })
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}
