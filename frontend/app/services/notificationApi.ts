import { fetchApi } from '@/app/lib/fetchApi'
import type { NotificationsResponse } from '@/app/types/notification'

export function getNotifications(token: string) {
  return fetchApi<NotificationsResponse>('/notifications', { token })
}

export function markNotificationRead(id: number, token: string) {
  return fetchApi<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH', token })
}

export function markAllNotificationsRead(token: string) {
  return fetchApi<{ updated: number }>('/notifications/read-all', { method: 'PATCH', token })
}
