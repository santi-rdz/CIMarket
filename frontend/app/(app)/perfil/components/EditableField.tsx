'use client'

import { useState } from 'react'
import Input from '@/app/components/ui/Input'

type Props = {
  label: string
  value: string
  hint?: string
  onSave?: (value: string) => Promise<void>
  readOnly?: boolean
  actionLabel?: string
}

export default function EditableField({
  label,
  value,
  hint,
  onSave,
  readOnly = false,
  actionLabel = 'Editar',
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (draft.trim() === value) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave?.(draft.trim())
      setEditing(false)
    } catch {
      // el error lo muestra el onError del mutation (toast)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {editing ? (
              <span className="flex flex-col gap-1">
                <span>Editar {label.toLowerCase()}</span>
                {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
              </span>
            ) : (
              label
            )}
          </p>

          {editing ? (
            <div className="mt-3 flex flex-col gap-3">
              <Input
                value={draft}
                onChange={(e) => setDraft((e.target as HTMLInputElement).value)}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="self-start rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          ) : (
            <p className="mt-0.5 text-sm text-slate-500">{value}</p>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setDraft(value)
              setEditing((v) => !v)
            }}
            className="shrink-0 text-sm font-medium text-slate-700 hover:underline"
          >
            {editing ? 'Cancelar' : actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
