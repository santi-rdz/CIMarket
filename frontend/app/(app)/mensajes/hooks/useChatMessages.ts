'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSocket } from '@/app/hooks/useSocket'
import { useConversation } from '@/app/hooks/useConversations'
import { markNotificationRead } from '@/app/services/notificationApi'
import type {
  Conversation,
  ConversationDetail,
  Message,
  MessageReply,
} from '@/app/types/conversation'
import type { AppNotification, NotificationsResponse } from '@/app/types/notification'

interface UseChatMessagesReturn {
  conversation: ConversationDetail | undefined
  isLoading: boolean
  messages: Message[]
  isTyping: boolean
  reply: MessageReply | null
  setReply: (msg: MessageReply | null) => void
  send: (content: string) => Promise<boolean>
  notifyTyping: () => void
}

type SendMessageAck = { ok: true; message: Message } | { ok: false; error: string }

export function useChatMessages(
  conversationId: string,
  currentUserId: string,
): UseChatMessagesReturn {
  const { data: conversation, isLoading } = useConversation(conversationId)
  const socket = useSocket()
  const queryClient = useQueryClient()

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const [socketMessages, setSocketMessages] = useState<Message[]>([])
  const [readAt, setReadAt] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [reply, setReply] = useState<MessageReply | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Derive messages: API base + socket additions, with read status applied
  const messages = useMemo<Message[]>(() => {
    const base = conversation?.messages ?? []
    const baseIds = new Set(base.map((m) => m.id))
    const all = [
      ...base,
      ...socketMessages.filter(
        (m) => !baseIds.has(m.id) && m.conversationId === conversationId,
      ),
    ]

    if (!readAt) return all

    return all.map((m) =>
      m.senderId === currentUserId &&
      !m.readAt &&
      new Date(m.createdAt) <= new Date(readAt)
        ? { ...m, readAt }
        : m,
    )
  }, [conversation?.messages, socketMessages, readAt, currentUserId, conversationId])

  // Mark related notifications as read when chat is opened
  useEffect(() => {
    if (!token || !conversationId) return

    const cached = queryClient.getQueryData<NotificationsResponse>(['notifications'])
    if (!cached) return

    const unread = cached.notifications.filter(
      (n: AppNotification) => !n.readAt && n.url.includes(conversationId),
    )

    if (unread.length === 0) return

    for (const notif of unread) {
      markNotificationRead(notif.id, token)
    }

    queryClient.setQueryData<NotificationsResponse>(['notifications'], (prev) => {
      if (!prev) return prev
      const now = new Date().toISOString()
      return {
        notifications: prev.notifications.map((n: AppNotification) =>
          unread.some((u) => u.id === n.id) ? { ...n, readAt: now } : n,
        ),
        unreadCount: Math.max(0, prev.unreadCount - unread.length),
      }
    })
  }, [conversationId, token, queryClient])

  useEffect(() => {
    if (!socket || !conversationId) return

    function joinConversation() {
      socket!.emit('join_conversation', conversationId)
      socket!.emit('mark_as_read', conversationId)
    }

    joinConversation()
    // Re-join if socket reconnects (server drops room memberships on disconnect)
    socket.on('connect', joinConversation)

    // Clear unread count for this conversation in the list cache
    queryClient.setQueryData<Conversation[]>(['conversations'], (prev) =>
      prev?.map((c) => (c.id === conversationId ? { ...c, _count: { messages: 0 } } : c)),
    )

    function onNewMessage(raw: Omit<Message, 'readAt'> & { readAt?: string | null }) {
      if (raw.conversationId !== conversationId) return
      const msg: Message = { ...raw, readAt: raw.readAt ?? null }
      setSocketMessages((prev) => [...prev, msg])
      // Only mark as read when the message comes from the other user
      if (raw.senderId !== currentUserId) {
        socket!.emit('mark_as_read', conversationId)
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    function onMessagesRead(data: { conversationId: string; readAt: Date }) {
      if (data.conversationId !== conversationId) return
      setReadAt(new Date(data.readAt).toISOString())
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    function onTyping(data: { userId: string; isTyping: boolean }) {
      if (data.userId !== currentUserId) setIsTyping(data.isTyping)
    }

    socket.on('new_message', onNewMessage as Parameters<typeof socket.on>[1])
    socket.on('messages_read', onMessagesRead)
    socket.on('user_typing', onTyping)

    return () => {
      socket.off('connect', joinConversation)
      socket.emit('leave_conversation', conversationId)
      socket.off('new_message', onNewMessage as Parameters<typeof socket.off>[1])
      socket.off('messages_read', onMessagesRead)
      socket.off('user_typing', onTyping)
    }
  }, [socket, conversationId, currentUserId, queryClient])

  async function send(content: string) {
    if (!content.trim()) return false
    if (!socket?.connected) {
      toast.error('No hay conexión en tiempo real. Intenta de nuevo en unos segundos.')
      return false
    }

    const replyToId = reply?.id

    return new Promise<boolean>((resolve) => {
      socket.timeout(5000).emit(
        'send_message',
        {
          conversationId,
          content: content.trim(),
          ...(replyToId ? { replyToId } : {}),
        },
        (err: Error | null, response?: SendMessageAck) => {
          if (err || !response) {
            toast.error('No se pudo enviar el mensaje')
            resolve(false)
            return
          }

          if (!response.ok) {
            toast.error(response.error)
            resolve(false)
            return
          }

          setReply(null)
          resolve(true)
        },
      )
    })
  }

  function notifyTyping() {
    if (!socket) return
    socket.emit('typing', { conversationId, isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(
      () => socket.emit('typing', { conversationId, isTyping: false }),
      1500,
    )
  }

  return {
    conversation,
    isLoading,
    messages,
    isTyping,
    reply,
    setReply,
    send,
    notifyTyping,
  }
}
