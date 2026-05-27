export type TransactionParty = {
  id: string
  name: string
  photoUrl: string | null
}

export type TransactionReview = {
  id: number
  rating: number
  comment: string | null
  createdAt: string
  from: TransactionParty & { photoUrl: string | null }
  to: { id: string; name: string }
}

export type Transaction = {
  id: string
  createdAt: string
  conversationId: string | null
  product: {
    id: string
    title: string
    slug: string
    images: { url: string }[]
  }
  seller: TransactionParty
  buyer: TransactionParty
  reviews: TransactionReview[]
}

/** Emitted over socket when a new transaction is created and the buyer needs to review */
export type SaleReviewPending = {
  transactionId: string
  productTitle: string
  productThumb: string | null
  sellerName: string
}
