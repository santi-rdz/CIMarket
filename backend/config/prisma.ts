import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '#generated/prisma/client'
import { requiredEnv } from '#config/env'

function databaseConfig() {
  if (
    process.env.DATABASE_HOST &&
    process.env.DATABASE_USER &&
    process.env.DATABASE_NAME
  ) {
    return {
      host: requiredEnv('DATABASE_HOST'),
      user: requiredEnv('DATABASE_USER'),
      password: process.env.DATABASE_PASSWORD ?? '',
      database: requiredEnv('DATABASE_NAME'),
      port: Number(process.env.DATABASE_PORT) || 3306,
    }
  }

  const databaseUrl = new URL(requiredEnv('DATABASE_URL'))
  return {
    host: databaseUrl.hostname,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, ''),
    port: Number(databaseUrl.port) || 3306,
  }
}

const database = databaseConfig()
const adapter = new PrismaMariaDb({
  host: database.host,
  user: database.user,
  password: database.password,
  database: database.database,
  connectionLimit: 5,
  port: database.port,
})
const prisma = new PrismaClient({ adapter })

export { prisma }
