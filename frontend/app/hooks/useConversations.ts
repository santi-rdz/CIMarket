'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConversations,
  getConversation,
  createConversation,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
  reportUser,
} from '@/app/services/conversationApi'
import { toastApiError } from '@/app/lib/fetchApi'
import { toast } from 'sonner'
import type { ReportReason } from '@/app/types/conversation'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}

export function useConversations() {
  const token = getToken()
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(token!),
    enabled: !!token,
    staleTime: 1000 * 30,
  })
}

export function useConversation(id: string | null) {
  const token = getToken()
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id!, token!),
    enabled: !!token && !!id,
    staleTime: 1000 * 60,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  const token = getToken()

  return useMutation({
    mutationFn: ({ sellerId, productId }: { sellerId: string; productId: string }) =>
      createConversation(sellerId, productId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: toastApiError,
  })
}

export function useArchiveConversation() {
  const queryClient = useQueryClient()
  const token = getToken()

  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      archived ? unarchiveConversation(id, token!) : archiveConversation(id, token!),
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success(archived ? 'Conversación desarchivada' : 'Conversación archivada')
    },
    onError: toastApiError,
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const token = getToken()

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversación eliminada')
    },
    onError: toastApiError,
  })
}

export function useReportUser() {
  const token = getToken()

  return useMutation({
    mutationFn: ({ conversationId, reason, detail }: { conversationId: string; reason: ReportReason; detail: string }) =>
      reportUser(conversationId, reason, detail, token!),
    onSuccess: () => {
      toast.success('Reporte enviado. Revisaremos tu caso.')
    },
    onError: toastApiError,
  })
}
