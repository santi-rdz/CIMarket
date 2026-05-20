'use client'

import { useEffect, useState } from 'react'
import { usePushNotifications } from '@/app/hooks/usePushNotifications'

export default function PushSetup() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('token'))
  }, [])

  usePushNotifications(token)
  return null
}
