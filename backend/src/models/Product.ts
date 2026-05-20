import type { ProductInput, ProductsQuery } from '#types/types'
import { prisma } from '#config/prisma'
import { generateUniqueSlug } from '#lib/slugify'

export default class ProductModel {
  static async getAll({
    search, status, condition, categoryIds, userId, campusIds,
    minPrice, maxPrice, sortBy, order = 'desc',
    page = 1, limit = 10,
  }: ProductsQuery) {
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (status) {
      where.status = { in: status.split(',').map((s) => s.trim().toUpperCase()) }
    }
    if (condition) {
      where.condition = { in: condition.split(',').map((c) => c.trim().toUpperCase()) }
    }
    if (categoryIds?.length) where.categoryId = { in: categoryIds }
    if (userId) where.userId = userId
    if (campusIds?.length) {
      where.campuses = { some: { id: { in: campusIds } } }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      }
    }

    const offset = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: sortBy ? { [sortBy]: order } : { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          condition: true,
          status: true,
          createdAt: true,
          images: { select: { id: true, url: true }, take: 1 },
          user: { select: { id: true, name: true, photoUrl: true } },
          category: { select: { id: true, name: true } },
          campuses: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static readonly detailSelect = {
    id: true,
    slug: true,
    title: true,
    description: true,
    price: true,
    condition: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    images: { select: { id: true, url: true } },
    user: { select: { id: true, name: true, photoUrl: true } },
    category: { select: { id: true, name: true } },
    campuses: { select: { id: true, name: true } },
    _count: { select: { favorites: true } },
  } as const

  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: ProductModel.detailSelect,
    })
  }

  static async getBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      select: ProductModel.detailSelect,
    })
  }

  static async create(data: ProductInput) {
    const { images, campusIds, ...productData } = data
    const slug = await generateUniqueSlug(productData.title)
    return prisma.product.create({
      data: {
        ...productData,
        slug,
        ...(images && {
          images: { create: images.map((url) => ({ url })) },
        }),
        ...(campusIds && {
          campuses: { connect: campusIds.map((id) => ({ id })) },
        }),
      },
      include: { images: true, category: true, campuses: true },
    })
  }

  static async update(id: string, data: Partial<ProductInput>) {
    const { images, campusIds, ...productData } = data
    const slugData = productData.title
      ? { slug: await generateUniqueSlug(productData.title, id) }
      : {}
    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...slugData,
        ...(images && {
          images: { deleteMany: {}, create: images.map((url) => ({ url })) },
        }),
        ...(campusIds && {
          campuses: { set: campusIds.map((id) => ({ id })) },
        }),
      },
      include: { images: true, category: true, campuses: true },
    })
  }

  static async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  }
}
