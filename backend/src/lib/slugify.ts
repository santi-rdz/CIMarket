import { prisma } from '#config/prisma'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')        // trim leading/trailing hyphens
    .slice(0, 250)
}

export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title)
  let candidate = base
  let suffix = 2

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })

    if (!existing || existing.id === excludeId) return candidate

    candidate = `${base}-${suffix}`
    suffix++
  }
}
