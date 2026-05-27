'use client'

import { useState } from 'react'
import { usePushNotifications } from '@/app/hooks/usePushNotifications'

export default function PushSetup() {
  const [token] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  )

  usePushNotifications(token)
  return null
}
