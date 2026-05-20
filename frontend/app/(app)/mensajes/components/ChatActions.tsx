'use client'

import { useState } from 'react'
import { HiOutlineArchiveBox, HiOutlineTrash, HiOutlineFlag } from 'react-icons/hi2'
import useClickOutside from '@/app/hooks/useClickOutside'
import { useArchiveConversation, useDeleteConversation, useReportUser } from '@/app/hooks/useConversations'
import type { ReportReason } from '@/app/types/conversation'

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ACOSO', label: 'Acoso' },
  { value: 'FRAUDE', label: 'Fraude' },
  { value: 'CONTENIDO_INAPROPIADO', label: 'Contenido inapropiado' },
  { value: 'OTRO', label: 'Otro' },
]

interface Props {
  conversationId: string
  isArchived: boolean
  onClose: () => void
  onDeleted: () => void
}

export default function ChatActions({ conversationId, isArchived, onClose, onDeleted }: Props) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  const [view, setView] = useState<'menu' | 'report' | 'confirmDelete'>('menu')
  const [reportReason, setReportReason] = useState<ReportReason | null>(null)
  const [reportDetail, setReportDetail] = useState('')

  const archiveMutation = useArchiveConversation()
  const deleteMutation = useDeleteConversation()
  const reportMutation = useReportUser()

  const handleArchive = () => {
    archiveMutation.mutate({ id: conversationId, archived: isArchived })
    onClose()
  }

  const handleDelete = () => {
    deleteMutation.mutate(conversationId, {
      onSuccess: () => {
        onClose()
        onDeleted()
      },
    })
  }

  const handleReport = () => {
    if (!reportReason) return
    reportMutation.mutate(
      { conversationId, reason: reportReason, detail: reportDetail },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
    >
      {view === 'menu' && (
        <>
          <button
            onClick={handleArchive}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 txt-5 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <HiOutlineArchiveBox className="size-4 text-slate-400" />
            {isArchived ? 'Desarchivar' : 'Archivar conversación'}
          </button>
          <button
            onClick={() => setView('confirmDelete')}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 txt-5 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <HiOutlineTrash className="size-4 text-slate-400" />
            Eliminar conversación
          </button>
          <hr className="my-1 border-slate-100" />
          <button
            onClick={() => setView('report')}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 txt-5 text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiOutlineFlag className="size-4" />
            Reportar usuario
          </button>
        </>
      )}

      {view === 'confirmDelete' && (
        <div className="px-4 py-3 space-y-3">
          <p className="txt-5 font-semibold text-slate-900">¿Eliminar conversación?</p>
          <p className="txt-6 text-slate-500 leading-relaxed">
            No podrás ver los mensajes de esta conversación. El otro usuario aún podrá verla.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setView('menu')}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 txt-6 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 txt-6 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="px-4 py-3 space-y-3">
          <p className="txt-5 font-semibold text-slate-900">Reportar usuario</p>
          <div className="space-y-1.5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setReportReason(r.value)}
                className={`w-full rounded-lg px-3 py-2 txt-6 text-left transition-colors ${
                  reportReason === r.value
                    ? 'bg-green-50 text-green-800 font-semibold border border-green-200'
                    : 'border border-slate-100 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {reportReason && (
            <textarea
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              placeholder="Detalle adicional (opcional)..."
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 txt-6 text-slate-900 placeholder:text-slate-400 outline-none focus-visible:outline-1.5 focus-visible:outline-green-800"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setView('menu')}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 txt-6 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleReport}
              disabled={!reportReason || reportMutation.isPending}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 txt-6 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Enviar reporte
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
