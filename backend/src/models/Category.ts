import { prisma } from '#config/prisma'

export default class CategoryModel {
  static async getAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, _count: { select: { products: true } } },
    })
  }

  static async getById(id: number) {
    return prisma.category.findUnique({ where: { id } })
  }

  static async create(name: string) {
    return prisma.category.create({ data: { name } })
  }

  static async update(id: number, name: string) {
    return prisma.category.update({ where: { id }, data: { name } })
  }

  static async delete(id: number) {
    return prisma.category.delete({ where: { id } })
  }
}
