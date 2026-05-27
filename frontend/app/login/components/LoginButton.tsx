'use client'

import { FcGoogle } from 'react-icons/fc'
import { useGoogleAuth } from '@/app/hooks/useGoogleAuth'

export default function LoginButton() {
  const { buttonContainerRef, loading, error } = useGoogleAuth()

  return (
    <div className="space-y-2">
      <div className="orb-wrapper">
        <div className="orb-blob" />
        <button
          disabled={loading}
          className="flex font-bold cursor-pointer txt-base leading-none bg-white rounded-full relative z-10 items-center gap-2 justify-center w-full py-4 disabled:opacity-50 pointer-events-none"
        >
          <FcGoogle size={24} />
          <span>{loading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
        </button>
        <div ref={buttonContainerRef} className="absolute inset-0 z-20 opacity-[0.01]" />
      </div>
      {error && <p className="text-red-600 txt-6 text-center font-medium">{error}</p>}
    </div>
  )
}
