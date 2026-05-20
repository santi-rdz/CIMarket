export type ProductImage = { id: number; url: string }
export type ProductUser = { id: string; name: string; photoUrl: string | null }
export type ProductCategory = { id: number; name: string }
export type ProductCampus = { id: number; name: string }

export type Product = {
  id: string
  slug: string
  title: string
  price: string
  condition: string
  status: string
  createdAt: string
  images: ProductImage[]
  user: ProductUser
  category: ProductCategory
  campuses: ProductCampus[]
}

export type ProductDetail = Product & {
  description: string
  updatedAt: string
  _count: { favorites: number }
}

export type ProductsResponse = {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}
