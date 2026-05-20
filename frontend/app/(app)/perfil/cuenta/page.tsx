'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyProfile, useUpdateProfile, useDeleteAccount } from '@/app/hooks/useProfile'
import EditableField from '../components/EditableField'
import Modal from '@/app/login/components/Modal'
import { Button } from '@/app/components/ui/button'
import { HiOutlineTrash } from 'react-icons/hi2'

export default function CuentaPage() {
  const { data: profile, isLoading } = useMyProfile()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { mutateAsync: deleteAccount, isPending: deleting } = useDeleteAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !profile) router.push('/login')
  }, [isLoading, profile, router])

  if (isLoading) return <PageSkeleton />
  if (!profile) return null

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  async function handleDeleteAccount() {
    await deleteAccount()
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <Modal>
    <div className="space-y-10">
      {/* Avatar + name */}
      <div className="flex flex-col items-start gap-3">
        {profile.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-700 text-2xl font-bold text-white">
            {initials}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
          <p className="text-sm text-slate-400">{profile.email}</p>
        </div>

        <div className="flex w-full divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
          <StatBox label="Publicaciones" value={profile._count.products} />
          <StatBox label="Reseñas" value={profile._count.sellerReviews} />
          <StatBox label="Favoritos" value={profile._count.favorites} />
        </div>
      </div>

      {/* Personal details */}
      <section>
        <h2 className="mb-2 text-lg font-bold text-slate-900">Detalles personales</h2>
        <div className="rounded-2xl border border-slate-100 px-4">
          <EditableField
            label="Nombre"
            value={profile.name}
            hint="Será visible en tu perfil para otros usuarios."
            onSave={async (name) => { await updateProfile({ name }) }}
          />
          <EditableField
            label="Correo electrónico"
            value={profile.email}
            readOnly
          />
          <EditableField
            label="Campus principal"
            value={profile.campus.name}
            readOnly
            actionLabel=""
          />
        </div>
      </section>

      {/* Manage account */}
      <section>
        <h2 className="mb-2 text-lg font-bold text-slate-900">Administrar cuenta</h2>
        <div className="rounded-2xl border border-slate-100 px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Eliminar cuenta</p>
              <p className="text-sm text-slate-400">
                Elimina permanentemente tu cuenta y todos tus datos.
              </p>
            </div>
            <Modal.Trigger opens="delete-account">
              <button
                type="button"
                className="txt-5 font-semibold text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </Modal.Trigger>
          </div>
        </div>
      </section>

      <Modal.Content name="delete-account" width="md" height="auto">
        <DeleteAccountConfirm isPending={deleting} onConfirm={handleDeleteAccount} />
      </Modal.Content>
    </div>
    </Modal>
  )
}

function DeleteAccountConfirm({ isPending, onConfirm, onCloseModal }: {
  isPending: boolean
  onConfirm: () => void
  onCloseModal?: () => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50">
          <HiOutlineTrash className="size-5 text-red-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="txt-3 font-bold text-slate-900">Eliminar cuenta</h2>
          <p className="txt-6 leading-relaxed text-slate-400">
            Esta acción es <span className="font-semibold text-slate-700">permanente e irreversible</span>. Se eliminarán tu perfil, publicaciones y datos asociados.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCloseModal}>
          Cancelar
        </Button>
        <Button
          className="flex-1 bg-red-600 text-white shadow-none hover:bg-red-700"
          isLoading={isPending}
          onClick={() => { onConfirm(); onCloseModal?.() }}
        >
          Sí, eliminar cuenta
        </Button>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-3">
      <span className="txt-3 font-bold text-slate-900">{value}</span>
      <span className="txt-6 text-slate-400">{label}</span>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="h-20 w-20 rounded-full bg-slate-100" />
        <div className="h-7 w-40 rounded bg-slate-100" />
        <div className="h-4 w-28 rounded bg-slate-100" />
      </div>
      <div className="h-40 rounded-2xl bg-slate-100" />
      <div className="h-20 rounded-2xl bg-slate-100" />
    </div>
  )
}
