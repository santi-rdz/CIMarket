import z from 'zod'

export const uuidSchema = z.uuid()
export const idSchema = z.coerce.number().int().positive()
