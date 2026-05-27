'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { ReviewModal } from '@/app/(app)/mensajes/components/ReviewModal'
import { useMe } from '@/app/hooks/useMe'
import { fetchApi } from '@/app/lib/fetchApi'
import type { Transaction } from '@/app/types/transaction'

interface ReviewContextValue {
  openReview: (transactionId: string) => void
}

const ReviewContext = createContext<ReviewContextValue>({ openReview: () => {} })

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe()
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  const openReview = useCallback(
    async (transactionId: string) => {
      if (!me) return
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
      try {
        const t = await fetchApi<Transaction>(`/transactions/${transactionId}`, { token })
        setTransaction(t)
      } catch {
        // transaction not found or no access — silently ignore
      }
    },
    [me],
  )

  return (
    <ReviewContext.Provider value={{ openReview }}>
      {children}
      {transaction && me && (
        <ReviewModal
          transaction={transaction}
          currentUserId={me.id}
          onClose={() => setTransaction(null)}
        />
      )}
    </ReviewContext.Provider>
  )
}

export function useReview() {
  return useContext(ReviewContext)
}
