import { fetchApi } from '@/app/lib/fetchApi'

export function getVapidKey() {
  return fetchApi<{ publicKey: string }>('/push/vapid-key')
}

export function savePushSubscription(subscription: PushSubscriptionJSON, token: string) {
  return fetchApi<{ subscribed: boolean }>('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      },
    }),
    token,
  })
}

export function removePushSubscription(endpoint: string, token: string) {
  return fetchApi<{ unsubscribed: boolean }>('/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
    token,
  })
}
