'use client'

import { useState } from 'react'
import { HiOutlineArchiveBox, HiOutlinePhoto } from 'react-icons/hi2'
import { cn, timeAgo } from '@/app/lib/utils'
import type { Conversation } from '@/app/types/conversation'

type Tab = 'active' | 'archived'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  currentUserId: string
  onSelect: (id: string) => void
}

export default function ConversationList({
  conversations,
  activeId,
  currentUserId,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<Tab>('active')

  const active: Conversation[] = []
  const archived: Conversation[] = []

  for (const conv of conversations) {
    const isArchived =
      conv.buyerId === currentUserId ? !!conv.buyerArchivedAt : !!conv.sellerArchivedAt
    ;(isArchived ? archived : active).push(conv)
  }

  const list = tab === 'active' ? active : archived

  return (
    <>
      {/* Header + tabs */}
      <div className="border-b border-slate-100">
        <div className="px-5 pt-4 pb-0">
          <h1 className="txt-4 font-bold text-slate-900">Mensajes</h1>
        </div>
        <div className="flex gap-0 px-5 mt-3">
          <button
            onClick={() => setTab('active')}
            className={cn(
              'px-3 pb-2.5 txt-6 font-semibold border-b-2 transition-colors',
              tab === 'active'
                ? 'border-green-700 text-green-800'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            )}
          >
            Activos{active.length > 0 && ` (${active.length})`}
          </button>
          <button
            onClick={() => setTab('archived')}
            className={cn(
              'px-3 pb-2.5 txt-6 font-semibold border-b-2 transition-colors flex items-center gap-1.5',
              tab === 'archived'
                ? 'border-green-700 text-green-800'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            )}
          >
            <HiOutlineArchiveBox className="size-3.5" />
            Archivados{archived.length > 0 && ` (${archived.length})`}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <HiOutlineArchiveBox className="size-8 text-slate-200 mb-3" />
            <p className="txt-5 text-slate-400">
              {tab === 'active'
                ? 'No tienes conversaciones activas'
                : 'No tienes conversaciones archivadas'}
            </p>
          </div>
        )}

        {list.map((conv) => {
          const otherUser = conv.buyer.id === currentUserId ? conv.seller : conv.buyer
          const firstName = otherUser.name.split(' ')[0]
          const lastMsg = conv.messages[0]
          const unread = conv._count.messages
          const isActive = conv.id === activeId
          const thumb = conv.product.images[0]?.url
          const lastMsgPrefix = lastMsg
            ? lastMsg.senderId === currentUserId
              ? 'Tú'
              : firstName
            : null

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors',
                isActive ? 'bg-green-50/60' : 'hover:bg-slate-50',
              )}
            >
              {/* Stacked avatars: product main + user small */}
              <div className="relative size-11 shrink-0">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={conv.product.title}
                    className="size-11 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100">
                    <HiOutlinePhoto className="size-5 text-slate-300" />
                  </div>
                )}
                {otherUser.photoUrl ? (
                  <img
                    src={otherUser.photoUrl}
                    alt={otherUser.name}
                    referrerPolicy="no-referrer"
                    className="absolute -bottom-1 -right-1 size-5 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-slate-700 ring-2 ring-white text-[8px] font-bold text-white">
                    {otherUser.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      'txt-5 truncate',
                      unread > 0
                        ? 'font-bold text-slate-900'
                        : 'font-semibold text-slate-700',
                    )}
                  >
                    {firstName}
                    <span className="font-normal text-slate-400 mx-1">·</span>
                    <span
                      className={cn(
                        'font-normal',
                        unread > 0 ? 'text-slate-700' : 'text-slate-500',
                      )}
                    >
                      {conv.product.title}
                    </span>
                  </p>
                  {lastMsg && (
                    <span className="txt-6 shrink-0 text-slate-400">
                      {timeAgo(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p
                    className={cn(
                      'txt-6 truncate',
                      unread > 0 ? 'font-medium text-slate-700' : 'text-slate-400',
                    )}
                  >
                    {lastMsgPrefix ? (
                      <>
                        <span className="font-semibold">{lastMsgPrefix}:</span>{' '}
                        {lastMsg!.content}
                      </>
                    ) : (
                      'Sin mensajes'
                    )}
                  </p>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-700 px-1.5 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
