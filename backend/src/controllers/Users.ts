import type { RequestHandler } from 'express'
import { validateUser, usersQuerySchema } from '@cm/shared/schemas/user'
import {
  validateUpdateUser,
  validateUserPreferences,
} from '@cm/shared/schemas/userPreferences'
import { formatZodErrors } from '@cm/shared/schemas/common'
import { PRODUCT_STATUSES } from '@cm/shared/constants'
import { parsePagination } from '#lib/utils'
import UserModel from '#models/User'
import UserPreferencesModel from '#models/UserPreferences'
import { uuidSchema } from '@cm/shared/schemas/fields'
import { prisma } from '#config/prisma'

const PRODUCT_SELECT = {
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
}

/** Helper: valida :id y compara con req.user */
function parseId(req: Parameters<RequestHandler>[0]) {
  const parsed = uuidSchema.safeParse(req.params.id)
  if (!parsed.success) return { error: 'Invalid user ID' as const }
  const isOwner = req.user?.id === parsed.data
  return { id: parsed.data, isOwner }
}

export default class UserController {
  /** GET /users */
  static getAll: RequestHandler = async (req, res) => {
    const parsed = usersQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid query params', details: formatZodErrors(parsed.error) })
      return
    }
    const { search, status, rol, sortBy } = parsed.data
    const { page, limit } = parsePagination(parsed.data)
    const result = await UserModel.getAll({ search, status, rol, sortBy, page, limit })
    res.json(result)
  }

  /** GET /users/:id — perfil completo si owner, público si no */
  static getById: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }

    if (ctx.isOwner) {
      const user = await UserModel.getById(ctx.id)
      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }
      res.json(user)
    } else {
      const profile = await UserModel.getPublicProfile(ctx.id)
      if (!profile) {
        res.status(404).json({ error: 'User not found' })
        return
      }
      res.json(profile)
    }
  }

  /** POST /users */
  static create: RequestHandler = async (req, res) => {
    const parsed = validateUser(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const existing = await UserModel.getByEmail(parsed.data.email)
    if (existing) {
      res.status(409).json({ error: 'Email already registered' })
      return
    }
    const user = await UserModel.create(parsed.data)
    res.status(201).json(user)
  }

  /** PATCH /users/:id — solo owner puede editar su perfil */
  static update: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }
    if (!ctx.isOwner) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const parsed = validateUpdateUser(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const user = await UserModel.update(ctx.id, parsed.data)
    res.json(user)
  }

  /** DELETE /users/:id — solo owner puede eliminar su cuenta */
  static delete: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }
    if (!ctx.isOwner) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    await UserModel.delete(ctx.id)
    res.status(204).send()
  }

  /** GET /users/:id/products — owner ve todos, otros solo DISPONIBLE */
  static getProducts: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }

    const { page, limit } = parsePagination(req.query as Record<string, string>)
    const offset = (page - 1) * limit
    const statusParam =
      typeof req.query.status === 'string'
        ? req.query.status.trim().toUpperCase()
        : undefined
    const where: Record<string, unknown> = { userId: ctx.id }
    if (!ctx.isOwner) {
      where.status = { in: ['DISPONIBLE', 'VENDIDO'] }
    } else if (
      statusParam &&
      PRODUCT_STATUSES.includes(statusParam as (typeof PRODUCT_STATUSES)[number])
    ) {
      where.status = statusParam
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: PRODUCT_SELECT,
      }),
      prisma.product.count({ where }),
    ])

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  }

  /** GET /users/:id/favorites — solo owner */
  static getFavorites: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }
    if (!ctx.isOwner) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const { page, limit } = parsePagination(req.query as Record<string, string>)
    const offset = (page - 1) * limit

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: ctx.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: { product: { select: PRODUCT_SELECT } },
      }),
      prisma.favorite.count({ where: { userId: ctx.id } }),
    ])

    res.json({
      data: favorites.map((f) => f.product),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  }

  /** GET /users/:id/reviews */
  static getReviews: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }

    const reviews = await prisma.transactionReview.findMany({
      where: { toId: ctx.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        from: { select: { id: true, name: true, photoUrl: true } },
        transaction: {
          select: { product: { select: { id: true, title: true, slug: true } } },
        },
      },
    })

    res.json(
      reviews.map(({ from, transaction: t, ...r }) => ({
        ...r,
        reviewer: from,
        product: t.product,
      })),
    )
  }

  /** GET /users/:id/preferences — solo owner */
  static getPreferences: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }
    if (!ctx.isOwner) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const prefs = await UserPreferencesModel.getOrCreate(ctx.id)
    res.json(prefs)
  }

  /** PUT /users/:id/preferences — solo owner */
  static updatePreferences: RequestHandler = async (req, res) => {
    const ctx = parseId(req)
    if ('error' in ctx) {
      res.status(400).json({ error: ctx.error })
      return
    }
    if (!ctx.isOwner) {
      res.status(403).json({ error: 'No tienes permiso' })
      return
    }

    const parsed = validateUserPreferences(req.body)
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Validation failed', details: formatZodErrors(parsed.error) })
      return
    }
    const prefs = await UserPreferencesModel.update(ctx.id, parsed.data)
    res.json(prefs)
  }
}
