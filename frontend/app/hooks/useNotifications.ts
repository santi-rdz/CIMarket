'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/app/services/notificationApi'
import { useSocket } from '@/app/hooks/useSocket'
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

  const socket = useSocket()

  // Listen for real-time notification events
  useEffect(() => {
    if (!token || !socket) return

    const handleNotification = (notif: AppNotification) => {
      // Prepend to cache
      queryClient.setQueryData<{ notifications: AppNotification[]; unreadCount: number }>(
        ['notifications'],
        (prev) => {
          if (!prev) return { notifications: [notif], unreadCount: 1 }
          return {
            notifications: [notif, ...prev.notifications],
            unreadCount: prev.unreadCount + 1,
          }
        },
      )

      // Refresh conversation list so unread counts and last message update
      if (notif.type === 'MESSAGE') {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }

      // Show toast
      toast(notif.title, {
        description: notif.body,
        action: {
          label: 'Ver',
          onClick: () => {
            window.location.href = notif.url
          },
        },
      })
    }

    socket.on('notification', handleNotification)
    return () => {
      socket.off('notification', handleNotification)
    }
  }, [token, socket, queryClient])

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
