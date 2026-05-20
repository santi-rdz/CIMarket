import { prisma } from '#config/prisma'

export default class CampusModel {
  static async getAll() {
    return prisma.campus.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  static async getById(id: number) {
    return prisma.campus.findUnique({ where: { id } })
  }
}
