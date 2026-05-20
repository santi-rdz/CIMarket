'use client'

import { useEffect } from 'react'
import { getVapidKey, savePushSubscription } from '@/app/services/pushApi'

export function usePushNotifications(token: string | null) {
  useEffect(() => {
    if (!token || typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function setup() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('[Push] Permission not granted:', permission)
          return
        }

        const existing = await registration.pushManager.getSubscription()
        if (existing) {
          // Re-save in case it wasn't persisted to backend
          await savePushSubscription(existing.toJSON() as PushSubscriptionJSON, token!)
          return
        }

        const { publicKey } = await getVapidKey()
        if (!publicKey) {
          console.warn('[Push] No VAPID public key returned from server')
          return
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        await savePushSubscription(subscription.toJSON() as PushSubscriptionJSON, token!)
        console.info('[Push] Subscription saved')
      } catch (err) {
        console.error('[Push] Setup error:', err)
      }
    }

    setup()
  }, [token])
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
