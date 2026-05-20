'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2'
import { useConversations } from '@/app/hooks/useConversations'
import { useMe } from '@/app/hooks/useMe'
import ConversationList from './ConversationList'
import ChatPanel from './ChatPanel'
import EmptyMessages from './EmptyMessages'
import { ConversationListSkeleton, ChatPanelSkeleton } from './MessagesSkeleton'

export default function MessagesClient() {
  const searchParams = useSearchParams()
  const { data: conversations, isLoading } = useConversations()
  const { data: me } = useMe()
  const [activeId, setActiveId] = useState<string | null>(searchParams.get('chat'))

  // Sync from URL on mount
  useEffect(() => {
    const chatId = searchParams.get('chat')
    if (chatId) setActiveId(chatId)
  }, [searchParams])

  if (!me) {
    return (
      <div className="flex h-[calc(100dvh-var(--header-h,57px))] items-center justify-center">
        <p className="txt-5 text-slate-400">Inicia sesión para ver tus mensajes</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex h-[calc(100dvh-var(--header-h,57px)-80px)] max-w-[1120px] md:h-[calc(100dvh-var(--header-h,57px))] md:py-6 md:px-6">
        <div className="flex w-full overflow-hidden rounded-none md:rounded-2xl md:border md:border-slate-100 md:shadow-sm">
          <div className="w-full shrink-0 md:w-80 md:border-r md:border-slate-100">
            <ConversationListSkeleton />
          </div>
          <div className="hidden md:flex flex-1">
            <ChatPanelSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!conversations?.length) {
    return <EmptyMessages />
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--header-h,57px)-80px)] max-w-[1120px] md:h-[calc(100dvh-var(--header-h,57px))] md:py-6 md:px-6">
      <div className="flex w-full overflow-hidden rounded-none md:rounded-2xl md:border md:border-slate-100 md:shadow-sm">
        {/* Conversation list — hidden on mobile when chat is active */}
        <div
          className={`w-full shrink-0 md:w-80 md:shrink-0 md:border-r md:border-slate-100 ${activeId ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            currentUserId={me.id}
            onSelect={setActiveId}
          />
        </div>

        {/* Chat panel — full screen on mobile when active */}
        <div
          className={`flex-1 ${activeId ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}
        >
          {activeId ? (
            <ChatPanel
              key={activeId}
              conversationId={activeId}
              currentUserId={me.id}
              onBack={() => setActiveId(null)}
              onDeleted={() => setActiveId(null)}
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50">
                  <HiOutlineChatBubbleBottomCenterText className="size-7 text-slate-300" />
                </div>
                <p className="txt-5 text-slate-400">Selecciona una conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
