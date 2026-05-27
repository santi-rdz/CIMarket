import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import {
  PrismaClient,
  ProductCondition,
  ProductStatus,
  UserRole,
  UserStatus,
} from '../generated/prisma/client'

dotenv.config()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

const adapter = new PrismaMariaDb({
  host: requireEnv('DATABASE_HOST'),
  user: requireEnv('DATABASE_USER'),
  password: requireEnv('DATABASE_PASSWORD'),
  database: requireEnv('DATABASE_NAME'),
  charset: 'utf8mb4',
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

function randomAvatar() {
  const gender = Math.random() < 0.5 ? 'men' : 'women'
  const n = Math.floor(Math.random() * 99) + 1
  return `https://randomuser.me/api/portraits/${gender}/${n}.jpg`
}

function randomProductImage() {
  const id = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/400/400?random=${id}`
}

function randomPrice() {
  return Math.floor(Math.random() * 5000) + 100
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 250)
}

const slugCounts = new Map<string, number>()
function uniqueSlug(title: string): string {
  const base = slugify(title)
  const count = (slugCounts.get(base) ?? 0) + 1
  slugCounts.set(base, count)
  return count === 1 ? base : `${base}-${count}`
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomCondition(): ProductCondition {
  return pick([
    ProductCondition.NUEVO,
    ProductCondition.COMO_NUEVO,
    ProductCondition.BUEN_ESTADO,
    ProductCondition.DIGITAL,
  ])
}

// Campus data
const campusData = [
  'Tijuana - Otay',
  'Tijuana - Valle de las Palmas',
  'Tecate',
  'Rosarito - CER',
  'Mexicali - Zona Urbana',
  'Mexicali - Km 43',
  'Mexicali - Ciudad Morelos Cuervos',
  'Mexicali - San Felipe',
  'Ensenada - El Sauzal',
  'Ensenada - Valle Dorado',
  'Ensenada - San Quintín',
  'Ensenada - Valle de Guadalupe',
]

// Categories
const categories = [
  'Libros y Apuntes',
  'Electrónica',
  'Ropa y Calzado',
  'Deportes',
  'Accesorios',
  'Hogar',
  'Videojuegos',
  'Instrumentos Musicales',
]

// Users — variando rol y status
const userTemplates = [
  // Admins
  {
    id: randomUUID(),
    name: 'Admin Principal',
    email: 'admin@uabc.edu.mx',
    googleId: 'google-admin-001',
    rol: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Sofía Administradora',
    email: 'sofia.admin@uabc.edu.mx',
    googleId: 'google-admin-002',
    rol: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  },
  // Usuarios activos
  {
    id: randomUUID(),
    name: 'Juan Pérez',
    email: 'juan.perez@uabc.edu.mx',
    googleId: 'google-juan-001',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Raúl Rodríguez',
    email: 'raul.rodriguez39@uabc.edu.mx',
    googleId: 'google-raul-rodriguez-039',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'María García',
    email: 'maria.garcia@uabc.edu.mx',
    googleId: 'google-maria-002',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Carlos López',
    email: 'carlos.lopez@uabc.edu.mx',
    googleId: 'google-carlos-003',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Ana Martínez',
    email: 'ana.martinez@uabc.edu.mx',
    googleId: 'google-ana-004',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Luis Rodríguez',
    email: 'luis.rodriguez@uabc.edu.mx',
    googleId: 'google-luis-005',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Fernanda Torres',
    email: 'fernanda.torres@uabc.edu.mx',
    googleId: 'google-fernanda-006',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Diego Hernández',
    email: 'diego.hernandez@uabc.edu.mx',
    googleId: 'google-diego-007',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  {
    id: randomUUID(),
    name: 'Valeria Mendoza',
    email: 'valeria.mendoza@uabc.edu.mx',
    googleId: 'google-valeria-008',
    rol: UserRole.USER,
    status: UserStatus.ACTIVE,
  },
  // Usuarios baneados
  {
    id: randomUUID(),
    name: 'Roberto Scammer',
    email: 'roberto.banned@uabc.edu.mx',
    googleId: 'google-roberto-009',
    rol: UserRole.USER,
    status: UserStatus.BANNED,
  },
  {
    id: randomUUID(),
    name: 'Patricia Spam',
    email: 'patricia.banned@uabc.edu.mx',
    googleId: 'google-patricia-010',
    rol: UserRole.USER,
    status: UserStatus.BANNED,
  },
]

// Product templates
const productTemplates = [
  // Libros y Apuntes
  {
    title: 'Libro de Cálculo Integral',
    description:
      'Libro de texto usado para cálculo integral, en excelente estado. Incluye ejercicios resueltos.',
    categoryName: 'Libros y Apuntes',
  },
  {
    title: 'Apuntes de Programación II',
    description:
      'Apuntes digitales bien organizados del curso de Programación II. Incluye ejemplos de código.',
    categoryName: 'Libros y Apuntes',
  },
  {
    title: 'Cálculo de Stewart 8va Edición',
    description:
      'Libro en excelente estado, pocas marcas de lápiz. Ideal para cálculo diferencial e integral.',
    categoryName: 'Libros y Apuntes',
  },
  {
    title: 'Apuntes Física General',
    description:
      'Apuntes completos de Física General, semestre 2024. Incluye resúmenes y fórmulas clave.',
    categoryName: 'Libros y Apuntes',
  },
  {
    title: 'Libro Álgebra Lineal',
    description:
      'Texto de Álgebra Lineal con ejemplos resueltos. Perfecto para primer año de ingeniería.',
    categoryName: 'Libros y Apuntes',
  },
  // Electrónica
  {
    title: 'Laptop HP 15 pulgadas',
    description:
      'Laptop HP 15" con procesador Ryzen 5, 8GB RAM. Funciona perfectamente, apenas utilizada.',
    categoryName: 'Electrónica',
  },
  {
    title: 'Monitor 24 pulgadas',
    description:
      'Monitor LED 24" Full HD, con cables incluidos. Excelente para gaming o trabajo.',
    categoryName: 'Electrónica',
  },
  {
    title: 'Teclado mecánico RGB',
    description:
      'Teclado mecánico switches blue, retroiluminación RGB. Como nuevo, poco uso.',
    categoryName: 'Electrónica',
  },
  {
    title: 'Audífonos Sony WH-1000XM4',
    description:
      'Audífonos con cancelación de ruido, batería de 30h. Perfectos para estudiar.',
    categoryName: 'Electrónica',
  },
  {
    title: 'iPad 9na generación',
    description: 'iPad 64GB WiFi, con funda y Apple Pencil 1ra gen. Estado impecable.',
    categoryName: 'Electrónica',
  },
  {
    title: 'Micrófono Blue Yeti',
    description:
      'Micrófono USB condensador, ideal para clases virtuales o podcasts. Con soporte incluido.',
    categoryName: 'Electrónica',
  },
  {
    title: 'Cámara Canon EOS Rebel T7',
    description:
      'Cámara DSLR con lente 18-55mm, batería y cargador. Perfecta para proyectos de fotografía.',
    categoryName: 'Electrónica',
  },
  // Ropa y Calzado
  {
    title: 'Sudadera Universitaria UABC',
    description: 'Sudadera de la universidad, color gris, talla M. Como nueva, sin uso.',
    categoryName: 'Ropa y Calzado',
  },
  {
    title: 'Tenis Nike Air Max 270',
    description:
      'Tenis talla 27, color blanco/negro. Usados 3 veces, prácticamente nuevos.',
    categoryName: 'Ropa y Calzado',
  },
  {
    title: 'Chamarra impermeable',
    description:
      'Chamarra impermeable talla L, color azul marino. Ideal para temporada de lluvia.',
    categoryName: 'Ropa y Calzado',
  },
  {
    title: 'Uniforme de laboratorio',
    description:
      'Bata blanca talla M y pantalón de seguridad. Usados un semestre, en buen estado.',
    categoryName: 'Ropa y Calzado',
  },
  // Deportes
  {
    title: 'Patineta profesional',
    description:
      'Tabla de skateboard profesional completa, ruedas nuevas, lista para usar.',
    categoryName: 'Deportes',
  },
  {
    title: 'Bicicleta de montaña',
    description:
      'Bicicleta MTB rodada 26, cambios Shimano 21 velocidades. Buen estado, usada en campus.',
    categoryName: 'Deportes',
  },
  {
    title: 'Pesas ajustables 20kg',
    description: 'Set de pesas ajustables de 2 a 20kg. Perfectas para entrenar en casa.',
    categoryName: 'Deportes',
  },
  {
    title: 'Raqueta de tenis Wilson',
    description:
      'Raqueta Wilson Pro Staff 97, con funda. Usada una temporada, excelente estado.',
    categoryName: 'Deportes',
  },
  // Accesorios
  {
    title: 'Mochila de viaje',
    description:
      'Mochila impermeable 40L, perfecta para estudiantes. Color negro, en buen estado.',
    categoryName: 'Accesorios',
  },
  {
    title: 'Calculadora Casio fx-991',
    description:
      'Calculadora científica Casio fx-991 EX. Funciona perfectamente, incluye funda.',
    categoryName: 'Accesorios',
  },
  {
    title: 'Funda MacBook Pro 13"',
    description:
      'Funda de cuero sintético para MacBook Pro 13", color café. Sin uso, como nueva.',
    categoryName: 'Accesorios',
  },
  // Hogar
  {
    title: 'Escritorio para estudiante',
    description:
      'Escritorio de madera, 120x60cm, ideal para estudiar. Buen estado, poco usado.',
    categoryName: 'Hogar',
  },
  {
    title: 'Silla ergonómica de oficina',
    description:
      'Silla con soporte lumbar, ajuste de altura y reposabrazo. Perfecta para largas sesiones de estudio.',
    categoryName: 'Hogar',
  },
  {
    title: 'Lámpara de escritorio LED',
    description:
      'Lámpara LED con intensidad regulable y puerto USB. Como nueva, modelo 2023.',
    categoryName: 'Hogar',
  },
  {
    title: 'Mini refrigerador 60L',
    description:
      'Refrigerador compacto ideal para cuarto de estudiante. Funciona perfectamente.',
    categoryName: 'Hogar',
  },
  // Videojuegos
  {
    title: 'Nintendo Switch',
    description:
      'Consola Nintendo Switch con 2 controles, incluye juegos. Funciona perfectamente.',
    categoryName: 'Videojuegos',
  },
  {
    title: 'PlayStation 4 Pro 1TB',
    description: 'PS4 Pro con 2 controles y 5 juegos. Excelente estado, sin rayones.',
    categoryName: 'Videojuegos',
  },
  {
    title: 'Xbox Series S',
    description: 'Consola Xbox Series S 512GB, poco uso. Incluye control y cables.',
    categoryName: 'Videojuegos',
  },
  {
    title: 'Juegos PS4 variados',
    description:
      'Lote de 6 juegos PS4: FIFA 23, Spider-Man, God of War, entre otros. Todos funcionando.',
    categoryName: 'Videojuegos',
  },
  // Instrumentos Musicales
  {
    title: 'Guitarra acústica',
    description:
      'Guitarra acústica para principiantes, color natural. Incluye funda y correa.',
    categoryName: 'Instrumentos Musicales',
  },
  {
    title: 'Teclado Casio CT-S300',
    description:
      'Teclado de 61 teclas con 400 tonos y ritmos. Perfecto para aprender música.',
    categoryName: 'Instrumentos Musicales',
  },
  {
    title: 'Cajón flamenco',
    description:
      'Cajón peruano de madera, sonido potente y definido. Poco uso, como nuevo.',
    categoryName: 'Instrumentos Musicales',
  },
]

async function main() {
  console.log('🌱 Iniciando seed...')

  console.log('🗑️  Limpiando datos existentes...')
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.campus.deleteMany()

  // Resetear auto-increment
  await prisma.$executeRaw`ALTER TABLE campuses AUTO_INCREMENT = 1`
  await prisma.$executeRaw`ALTER TABLE categories AUTO_INCREMENT = 1`
  await prisma.$executeRaw`ALTER TABLE product_images AUTO_INCREMENT = 1`
  await prisma.$executeRaw`ALTER TABLE reviews AUTO_INCREMENT = 1`

  console.log('📍 Creando campus...')
  const createdCampuses = await Promise.all(
    campusData.map((name) => prisma.campus.create({ data: { name } })),
  )
  console.log(`✅ ${createdCampuses.length} campus creados`)

  console.log('📂 Creando categorías...')
  const createdCategories = await Promise.all(
    categories.map((name) => prisma.category.create({ data: { name } })),
  )
  console.log(`✅ ${createdCategories.length} categorías creadas`)

  console.log('👥 Creando usuarios...')
  const createdUsers = await Promise.all(
    userTemplates.map((user) =>
      prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          googleId: user.googleId,
          photoUrl: randomAvatar(),
          rol: user.rol,
          status: user.status,
        },
      }),
    ),
  )
  console.log(`✅ ${createdUsers.length} usuarios creados`)

  // Solo los usuarios activos publican productos
  const activeUsers = createdUsers.filter((u) => u.status === UserStatus.ACTIVE)

  console.log('📦 Creando productos...')
  const createdProducts = await Promise.all(
    productTemplates.flatMap((template) => {
      const count = Math.floor(Math.random() * 2) + 3
      return Array.from({ length: count }, () => {
        const category = createdCategories.find((c) => c.name === template.categoryName)
        // Cada producto disponible en 1-3 campus aleatorios
        const campusCount = Math.floor(Math.random() * 3) + 1
        const shuffled = [...createdCampuses].sort(() => Math.random() - 0.5)
        const productCampuses = shuffled.slice(0, campusCount)
        return prisma.product.create({
          data: {
            id: randomUUID(),
            slug: uniqueSlug(template.title),
            title: template.title,
            description: template.description,
            price: randomPrice(),
            condition: randomCondition(),
            status: pick([
              ProductStatus.DISPONIBLE,
              ProductStatus.DISPONIBLE,
              ProductStatus.DISPONIBLE,
              ProductStatus.VENDIDO,
              ProductStatus.RESERVADO,
            ]),
            userId: pick(activeUsers).id,
            categoryId: category!.id,
            campuses: {
              connect: productCampuses.map((c) => ({ id: c.id })),
            },
          },
        })
      })
    }),
  )
  console.log(`✅ ${createdProducts.length} productos creados`)

  console.log('🖼️  Agregando imágenes a productos...')
  const productImages = await Promise.all(
    createdProducts.map((product) => {
      const imageCount = Math.floor(Math.random() * 3) + 2
      return Promise.all(
        Array.from({ length: imageCount }, () =>
          prisma.productImage.create({
            data: { url: randomProductImage(), productId: product.id },
          }),
        ),
      )
    }),
  )
  const totalImages = productImages.flat().length
  console.log(`✅ ${totalImages} imágenes agregadas`)

  console.log('⭐ Creando reviews de vendedores...')
  const reviewComments = [
    'Excelente vendedor, muy puntual y amable.',
    'Todo perfecto, el producto llegó como se describió.',
    'Buena comunicación, recomendado.',
    'Muy confiable, volvería a comprarle.',
    'Regular, tardó en responder.',
    'Súper bien, muy atento con las dudas.',
    'Todo en orden, buen trato.',
    'Cumplió con lo acordado, sin problemas.',
  ]
  const createdReviews = []
  const reviewPairs = new Set<string>()
  // Vendedores = usuarios que tienen al menos un producto
  const sellerIds = [...new Set(createdProducts.map((p) => p.userId))]
  for (const sellerId of sellerIds) {
    const reviewCount = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < reviewCount; i++) {
      const reviewer = pick(activeUsers.filter((u) => u.id !== sellerId))
      const key = `${reviewer.id}-${sellerId}`
      if (reviewPairs.has(key)) continue
      reviewPairs.add(key)
      const review = await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 3) + 3, // 3-5
          comment: pick(reviewComments),
          reviewerId: reviewer.id,
          sellerId,
        },
      })
      createdReviews.push(review)
    }
  }
  console.log(`✅ ${createdReviews.length} reviews creadas`)

  console.log('❤️  Creando favoritos...')
  const favoritePairs = new Set<string>()
  const createdFavorites = []
  for (const user of activeUsers.slice(0, 6)) {
    const favCount = Math.floor(Math.random() * 3) + 1
    const shuffledProducts = [...createdProducts].sort(() => Math.random() - 0.5)
    for (const product of shuffledProducts.slice(0, favCount)) {
      const key = `${user.id}-${product.id}`
      if (favoritePairs.has(key)) continue
      favoritePairs.add(key)
      const fav = await prisma.favorite.create({
        data: { userId: user.id, productId: product.id },
      })
      createdFavorites.push(fav)
    }
  }
  console.log(`✅ ${createdFavorites.length} favoritos creados`)

  const admins = createdUsers.filter((u) => u.rol === UserRole.ADMIN).length
  const banned = createdUsers.filter((u) => u.status === UserStatus.BANNED).length

  console.log(`
✨ Seed completado!
📊 Resumen:
   - Campus: ${createdCampuses.length}
   - Categorías: ${createdCategories.length}
   - Usuarios: ${createdUsers.length} (${admins} admins, ${banned} baneados)
   - Productos: ${createdProducts.length}
   - Imágenes: ${totalImages}
   - Reviews: ${createdReviews.length}
   - Favoritos: ${createdFavorites.length}
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
