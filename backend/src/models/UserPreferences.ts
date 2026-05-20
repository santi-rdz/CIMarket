import { prisma } from '#config/prisma'

type PreferencesUpsert = {
  emailNotifications?: boolean
  showContactInfo?: boolean
  campusIds?: number[]
}

const include = {
  campuses: {
    include: { campus: { select: { id: true, name: true } } },
  },
}

function format(prefs: {
  emailNotifications: boolean
  showContactInfo: boolean
  campuses: { campus: { id: number; name: string } }[]
}) {
  return {
    emailNotifications: prefs.emailNotifications,
    showContactInfo: prefs.showContactInfo,
    defaultCampuses: prefs.campuses.map((c) => c.campus),
  }
}

export default class UserPreferencesModel {
  static async getOrCreate(userId: string) {
    const existing = await prisma.userPreferences.findUnique({
      where: { userId },
      include,
    })
    if (existing) return format(existing)

    const created = await prisma.userPreferences.create({
      data: { userId },
      include,
    })
    return format(created)
  }

  static async update(userId: string, data: PreferencesUpsert) {
    const { campusIds, ...rest } = data

    const prefs = await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...rest },
      update: rest,
      select: { id: true },
    })

    if (campusIds !== undefined) {
      await prisma.userPreferenceCampus.deleteMany({ where: { prefId: prefs.id } })
      if (campusIds.length > 0) {
        await prisma.userPreferenceCampus.createMany({
          data: campusIds.map((campusId) => ({ prefId: prefs.id, campusId })),
        })
      }
    }

    return this.getOrCreate(userId)
  }
}
