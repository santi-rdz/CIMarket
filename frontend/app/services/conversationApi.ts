import { fetchApi } from '@/app/lib/fetchApi'
import type {
  Conversation,
  ConversationDetail,
  ReportReason,
} from '@/app/types/conversation'

export function getConversations(token: string) {
  return fetchApi<Conversation[]>('/conversations', { token })
}

export function getConversation(id: string, token: string) {
  return fetchApi<ConversationDetail>(`/conversations/${id}`, { token })
}

export function createConversation(sellerId: string, productId: string, token: string) {
  return fetchApi<{ id: string }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ sellerId, productId }),
    token,
  })
}

export function archiveConversation(id: string, token: string) {
  return fetchApi<{ archived: boolean }>(`/conversations/${id}/archive`, {
    method: 'PATCH',
    token,
  })
}

export function unarchiveConversation(id: string, token: string) {
  return fetchApi<{ archived: boolean }>(`/conversations/${id}/unarchive`, {
    method: 'PATCH',
    token,
  })
}

export function deleteConversation(id: string, token: string) {
  return fetchApi<void>(`/conversations/${id}`, {
    method: 'DELETE',
    token,
  })
}

export function sendMessage(
  conversationId: string,
  content: string,
  token: string,
  replyToId?: string,
) {
  return fetchApi<{
    id: string
    content: string
    senderId: string
    conversationId: string
    createdAt: string
    replyTo: { id: string; content: string; sender: { id: string; name: string } } | null
  }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, ...(replyToId ? { replyToId } : {}) }),
    token,
  })
}

export function reportUser(
  conversationId: string,
  reason: ReportReason,
  detail: string,
  token: string,
) {
  return fetchApi<{ reported: boolean }>(`/conversations/${conversationId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, detail }),
    token,
  })
}
