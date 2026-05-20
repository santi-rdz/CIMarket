import webpush from 'web-push'

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT ?? 'mailto:dev@cimarket.mx',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  )
}

export { webpush }
export const vapidPublicKey = VAPID_PUBLIC_KEY ?? ''
export const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
