'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useCampuses } from '@/app/hooks/useCampuses'
import { updateUserProfile } from '@/app/services/profileApi'
import { Button } from '@/app/components/ui/button'
import { HiOutlineAcademicCap } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { createPortal } from 'react-dom'

interface Props {
  userId: string
  onCloseModal?: () => void
}

export default function CampusSetupModal({ userId, onCloseModal }: Props) {
  const { data: campuses = [] } = useCampuses()
  const [selected, setSelected] = useState<number | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: (campusId: number) => updateUserProfile(userId, { campusId }),
    onSuccess: () => onCloseModal?.(),
  })

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex size-12 items-center justify-center rounded-full bg-green-50">
        <HiOutlineAcademicCap className="size-6 text-green-700" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="txt-3 font-bold text-slate-900">Selecciona tu campus</h2>
        <p className="txt-5 text-slate-400">
          Esto nos ayuda a mostrarte productos relevantes cerca de ti.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-h-60 overflow-y-auto">
        {campuses.map((campus) => (
          <button
            key={campus.id}
            type="button"
            onClick={() => setSelected(campus.id)}
            className={cn(
              'rounded-xl px-4 py-3 txt-5 font-medium text-left transition-colors',
              selected === campus.id
                ? 'bg-green-50 text-green-800 ring-1 ring-green-700'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
            )}
          >
            {campus.name}
          </button>
        ))}
      </div>

      <Button
        className="w-full"
        disabled={!selected}
        isLoading={isPending}
        onClick={() => selected && mutate(selected)}
      >
        Continuar
      </Button>
    </div>
  )
}
