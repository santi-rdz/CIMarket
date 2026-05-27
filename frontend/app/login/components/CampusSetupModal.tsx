'use client'

import { useState } from 'react'
import { useCampuses } from '@/app/hooks/useCampuses'
import { useSetupCampus } from '@/app/hooks/useProfile'
import { Button } from '@/app/components/ui/button'
import { HiCheck } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'

interface Props {
  userId: string
  onCloseModal?: () => void
  onSkip?: () => void
}

export default function CampusSetupModal({ userId, onCloseModal, onSkip }: Props) {
  const { data: campuses = [] } = useCampuses()
  const [selected, setSelected] = useState<number[]>([])

  const { mutate, isPending } = useSetupCampus(userId, () => onCloseModal?.())

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-5">
      <header className="w-full shrink-0 space-y-1 text-center">
        <h2 className="text-xl font-bold text-slate-900">¿En qué campus estás?</h2>
        <p className="text-sm text-slate-400">
          Puedes elegir uno o varios para ver productos cercanos.
        </p>
      </header>

      <div className={cn(
        'flex max-w-80 w-full flex-col gap-2 overflow-y-auto max-h-[380px] p-0.5',
        '[&::-webkit-scrollbar]:w-1.5',
        '[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200',
      )}>
        {campuses.map((campus) => {
          const isSelected = selected.includes(campus.id)
          return (
            <button
              key={campus.id}
              type="button"
              onClick={() => toggle(campus.id)}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors',
                isSelected
                  ? 'bg-green-50 text-green-800 ring-1 ring-green-700'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100',
              )}
            >
              {campus.name}
              {isSelected && <HiCheck className="size-4 shrink-0" />}
            </button>
          )
        })}
      </div>

      <div className="flex w-80 shrink-0 flex-col gap-2">
        <Button
          disabled={selected.length === 0}
          isLoading={isPending}
          onClick={() => mutate(selected)}
        >
          Continuar
        </Button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="txt-6 text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            Omitir por ahora
          </button>
        )}
      </div>
    </div>
  )
}
