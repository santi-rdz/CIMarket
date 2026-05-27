import { prisma } from '#config/prisma'
import type { ReportReason } from '#generated/prisma/enums'

export default class ReportModel {
  static async create(
    reporterId: string,
    reportedId: string,
    reason: string,
    detail?: string,
  ) {
    if (reporterId === reportedId) return null

    return prisma.report.create({
      data: { reporterId, reportedId, reason: reason as ReportReason, detail },
    })
  }
}
