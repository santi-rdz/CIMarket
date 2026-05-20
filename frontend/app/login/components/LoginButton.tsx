'use client'

import { FcGoogle } from 'react-icons/fc'
import { useGoogleAuth } from '@/app/hooks/useGoogleAuth'
import Modal from './Modal'
import CampusSetupModal from './CampusSetupModal'

export default function LoginButton() {
  const { buttonContainerRef, loading, error, campusSetup, onCampusDone } =
    useGoogleAuth()

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

      {campusSetup && (
        <Modal>
          <Modal.Auto name="campus-setup" />
          <Modal.Content width="lg" height="auto">
            <CampusSetupModal userId={campusSetup.userId} onCloseModal={onCampusDone} />
          </Modal.Content>
        </Modal>
      )}
    </div>
  )
}
