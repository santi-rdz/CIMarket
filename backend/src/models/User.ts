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
          campus: { select: { id: true, name: true } },
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
          campus: { select: { id: true, name: true } },
          _count: { select: { products: true, favorites: true, sellerReviews: true } },
        },
      }),
      prisma.review.aggregate({
        where: { sellerId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])
    if (!user) return null
    return {
      ...user,
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
          campus: { select: { id: true, name: true } },
          _count: { select: { products: true, sellerReviews: true } },
        },
      }),
      prisma.review.aggregate({
        where: { sellerId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])
    if (!user) return null
    return {
      ...user,
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

  static async upsertByGoogleId(googleId: string, data: Omit<UserInput, 'googleId'>) {
    const existing = await prisma.user.findUnique({ where: { googleId } })
    const user = await prisma.user.upsert({
      where: { googleId },
      update: { photoUrl: data.photoUrl },
      create: { googleId, ...data },
    })
    return { ...user, isNewUser: !existing }
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
