import { fetchApi } from '@/app/lib/fetchApi'
import type { Transaction, TransactionReview } from '@/app/types/transaction'

export function createTransaction(
  productId: string,
  buyerId: string,
  conversationId: string | undefined,
  token: string,
) {
  return fetchApi<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify({ productId, buyerId, conversationId }),
    token,
  })
}

export function getPendingReviews(token: string) {
  return fetchApi<Transaction[]>('/transactions/pending-reviews', { token })
}

export function getTransactionByProduct(productId: string, token: string) {
  return fetchApi<Transaction>(`/transactions/product/${productId}`, { token })
}

export function submitReview(
  transactionId: string,
  rating: number,
  comment: string | undefined,
  token: string,
) {
  return fetchApi<TransactionReview>(`/transactions/${transactionId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, ...(comment ? { comment } : {}) }),
    token,
  })
}
