'use client'

import { useEffect, useRef } from 'react'
import { useLogin } from './useLogin'
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

type Options = {
  onSuccess?: () => void
}

export function useGoogleAuth({ onSuccess }: Options = {}) {
  const { login, loading, error, campusSetup, onCampusDone } = useLogin({ onSuccess })
  const buttonContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = () => {
      if (!window.google || !buttonContainerRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => login(response.credential),
      })
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        size: 'large',
        width: buttonContainerRef.current.offsetWidth || 300,
      })
    }

    if (window.google) {
      init()
    } else {
      const interval = setInterval(() => {
        if (window.google) { init(); clearInterval(interval) }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [login])

  return { buttonContainerRef, loading, error, campusSetup, onCampusDone }
}
