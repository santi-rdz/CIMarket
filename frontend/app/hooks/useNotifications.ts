'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/app/services/notificationApi'
import type { AppNotification } from '@/app/types/notification'

export function useNotifications() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(token!),
    enabled: !!token,
    staleTime: 1000 * 60,
  })

  const markRead = useMutation({
    mutationFn: (id: number) => markNotificationRead(id, token!),
    onSuccess: (_, id) => {
      queryClient.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
        ['notifications'],
        (prev) => {
          if (!prev) return prev
          const wasUnread = prev.notifications.find((n) => n.id === id && !n.readAt)
          return {
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
            unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
          }
        },
      )
    },
  })

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(token!),
    onSuccess: () => {
      queryClient.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
        ['notifications'],
        (prev) => {
          if (!prev) return prev
          return {
            notifications: prev.notifications.map((n) => ({
              ...n,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
            unreadCount: 0,
          }
        },
      )
    },
  })

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  }
}
