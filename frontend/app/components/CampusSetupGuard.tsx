'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/app/hooks/useMe'
import { useMyPreferences } from '@/app/hooks/useProfile'
import Modal from '@/app/login/components/Modal'
import CampusSetupModal from '@/app/login/components/CampusSetupModal'

const SKIP_KEY = 'cm_campus_setup_skipped'

export default function CampusSetupGuard() {
  const { data: me } = useMe()
  const { data: prefs, isPending } = useMyPreferences()
  const qc = useQueryClient()
  const [skipped, setSkipped] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(SKIP_KEY) === '1',
  )

  if (!me || isPending) return null
  if (prefs && prefs.defaultCampuses.length > 0) return null
  if (skipped) return null

  function handleDone() {
    qc.invalidateQueries({ queryKey: ['user-preferences', me!.id] })
  }

  function handleSkip() {
    sessionStorage.setItem(SKIP_KEY, '1')
    setSkipped(true)
  }

  return (
    <Modal>
      <Modal.Auto name="campus-setup-guard" />
      <Modal.Content width="lg" height="auto">
        <CampusSetupModal userId={me.id} onCloseModal={handleDone} onSkip={handleSkip} />
      </Modal.Content>
    </Modal>
  )
}
