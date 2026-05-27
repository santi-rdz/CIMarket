import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, getPendingReviews, submitReview } from '@/app/services/transactionApi'

function useToken() {
  return typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
}

export function usePendingReviews() {
  const token = useToken()
  return useQuery({
    queryKey: ['transactions', 'pending-reviews'],
    queryFn: () => getPendingReviews(token),
    enabled: !!token,
    staleTime: 60_000,
  })
}

export function useMarkAsSold() {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      buyerId,
      conversationId,
    }: {
      productId: string
      buyerId: string
      conversationId?: string
    }) => createTransaction(productId, buyerId, conversationId, token),
    onSuccess: () => {
      // Product status changed to VENDIDO — invalidate all product-related queries
      qc.invalidateQueries({ queryKey: ['product'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['user-products'] })
      qc.invalidateQueries({ queryKey: ['relatedProducts'] })
      // Conversation archived by backend
      qc.invalidateQueries({ queryKey: ['conversations'] })
      // Backend created a pending review for both parties
      qc.invalidateQueries({ queryKey: ['transactions', 'pending-reviews'] })
    },
  })
}

export function useSubmitReview() {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      transactionId,
      rating,
      comment,
    }: {
      transactionId: string
      rating: number
      comment?: string
    }) => submitReview(transactionId, rating, comment, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', 'pending-reviews'] })
      // Reviewee's profile and reviews list may have updated rating/count
      qc.invalidateQueries({ queryKey: ['user-reviews'] })
      qc.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })
}
