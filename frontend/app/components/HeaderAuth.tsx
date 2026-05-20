'use client'

import { FcGoogle } from 'react-icons/fc'
import UserDropdown from './UserDropdown'
import { useGoogleAuth } from '@/app/hooks/useGoogleAuth'
import { useMe } from '@/app/hooks/useMe'
import { useQueryClient } from '@tanstack/react-query'

export default function HeaderAuth() {
  const queryClient = useQueryClient()
  const { data: user } = useMe()

  const { buttonContainerRef } = useGoogleAuth({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  if (user) {
    const initials = user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    return <UserDropdown user={{ ...user, initials }} />
  }

  return (
    <div className="orb-wrapper">
      <div className="orb-blob" />
      <button className="flex font-bold text-sm leading-none bg-white rounded-full relative z-10 items-center gap-2 justify-center px-4 py-2 pointer-events-none">
        <FcGoogle size={18} />
        <span>Iniciar sesión</span>
      </button>
      <div ref={buttonContainerRef} className="absolute inset-0 z-20 opacity-[0.01]" />
    </div>
  )
}
