import { prisma } from '#config/prisma'

export default class ReportModel {
  static async create(reporterId: string, reportedId: string, reason: string, detail?: string) {
    if (reporterId === reportedId) return null

    return prisma.report.create({
      data: { reporterId, reportedId, reason: reason as any, detail },
    })
  }
}
