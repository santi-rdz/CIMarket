'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSocket } from '@/app/hooks/useSocket'
import type { AppNotification, NotificationsResponse } from '@/app/types/notification'

export function RealtimeEventsProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    function handleNotification(notification: AppNotification) {
      queryClient.setQueryData<NotificationsResponse>(['notifications'], (prev) => {
        if (!prev) return { notifications: [notification], unreadCount: 1 }
        if (prev.notifications.some((item) => item.id === notification.id)) return prev

        return {
          notifications: [notification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1,
        }
      })

      if (notification.type === 'MESSAGE') {
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }

      if (notification.type === 'SALE_REVIEW') {
        queryClient.invalidateQueries({ queryKey: ['transactions', 'pending-reviews'] })
      }

      toast(notification.title, {
        description: notification.body,
        action: {
          label: 'Ver',
          onClick: () => {
            window.location.href = notification.url
          },
        },
      })
    }

    socket.on('notification', handleNotification)
    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, queryClient])

  return children
}
