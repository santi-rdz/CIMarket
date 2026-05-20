'use client'

import { useMyPreferences, useUpdatePreferences } from '@/app/hooks/useProfile'
import { useCampuses } from '@/app/hooks/useCampuses'
import CampusSelect from '@/app/components/CampusSelect'
import ToggleSwitch from '../components/ToggleSwitch'
import { HiX } from 'react-icons/hi'

export default function PreferenciasPage() {
  const { data: prefs, isLoading: loadingPrefs } = useMyPreferences()
  const { data: campuses = [] } = useCampuses()
  const { mutate: updatePrefs, isPending } = useUpdatePreferences()

  if (loadingPrefs) return <PageSkeleton />

  const selectedIds = prefs?.defaultCampuses.map((c) => String(c.id)) ?? []

  function handleCampusChange(ids: string[]) {
    updatePrefs({ campusIds: ids.map(Number) })
  }

  function removeTag(id: string) {
    handleCampusChange(selectedIds.filter((s) => s !== id))
  }

  function togglePref(key: 'emailNotifications' | 'showContactInfo', value: boolean) {
    updatePrefs({ [key]: value })
  }

  return (
    <div className="space-y-10">
      <h1 className="txt-2 font-bold text-slate-900">Preferencias</h1>

      {/* Campus por defecto */}
      <section className="space-y-3">
        <div>
          <h2 className="txt-5 font-semibold text-slate-900">Campus predeterminados</h2>
          <p className="txt-6 text-slate-400">
            Se usarán como filtro predeterminado en la búsqueda de productos.
          </p>
        </div>

        <CampusSelect
          value={selectedIds}
          onValueChange={handleCampusChange}
          placeholder="Seleccionar campus..."
          variant="outline"
        />

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const campus = campuses.find((c) => String(c.id) === id)
              if (!campus) return null
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 txt-6 font-medium leading-none text-green-800"
                >
                  {campus.name}
                  <button
                    type="button"
                    onClick={() => removeTag(id)}
                    disabled={isPending}
                    className="rounded-full p-0.5 hover:bg-green-100 disabled:opacity-50"
                  >
                    <HiX className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </section>

      {/* Notificaciones */}
      <section>
        <h2 className="txt-5 mb-3 font-semibold text-slate-900">Notificaciones</h2>
        <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4">
          <PreferenceRow
            label="Notificaciones por correo"
            description="Recibe alertas sobre mensajes y actividad en tus publicaciones."
            checked={prefs?.emailNotifications ?? true}
            onChange={(v) => togglePref('emailNotifications', v)}
            disabled={isPending}
          />
        </div>
      </section>

      {/* Privacidad */}
      <section>
        <h2 className="txt-5 mb-3 font-semibold text-slate-900">Privacidad</h2>
        <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 px-4">
          <PreferenceRow
            label="Mostrar información de contacto"
            description="Permite que otros usuarios vean tu información de contacto en tus publicaciones."
            checked={prefs?.showContactInfo ?? false}
            onChange={(v) => togglePref('showContactInfo', v)}
            disabled={isPending}
          />
        </div>
      </section>
    </div>
  )
}

function PreferenceRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="txt-5 font-semibold text-slate-900">{label}</p>
        <p className="txt-6 text-slate-400">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-40 rounded bg-slate-100" />
      <div className="h-32 rounded-2xl bg-slate-100" />
      <div className="h-20 rounded-2xl bg-slate-100" />
      <div className="h-20 rounded-2xl bg-slate-100" />
    </div>
  )
}
