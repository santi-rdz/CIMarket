'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiEllipsisVertical,
  HiOutlinePhoto,
  HiXMark,
} from 'react-icons/hi2'
import Input from '@/app/components/ui/Input'
import { useChatMessages } from '../hooks/useChatMessages'
import { MessageBubble } from './MessageBubble'
import { ChatPanelSkeleton } from './MessagesSkeleton'
import ChatActions from './ChatActions'
import { MarkAsSoldModal } from './MarkAsSoldModal'
import { ReviewModal } from './ReviewModal'
import { usePendingReviews } from '@/app/hooks/useTransactions'

interface Props {
  conversationId: string
  currentUserId: string
  onBack: () => void
  onDeleted: () => void
}

export default function ChatPanel({
  conversationId,
  currentUserId,
  onBack,
  onDeleted,
}: Props) {
  const {
    conversation,
    isLoading,
    messages,
    isTyping,
    reply,
    setReply,
    send,
    notifyTyping,
  } = useChatMessages(conversationId, currentUserId)
  const [input, setInput] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [showMarkSold, setShowMarkSold] = useState(false)
  const [reviewDismissed, setReviewDismissed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { data: pendingReviews } = usePendingReviews()
  const restPendingReview =
    pendingReviews?.find((t) => t.conversationId === conversationId) ?? null

  function handleReply(r: Parameters<typeof setReply>[0]) {
    setReply(r)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Auto-scroll to bottom on new messages or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function handleSend() {
    if (!input.trim()) return
    const sent = await send(input)
    if (sent) setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    notifyTyping()
  }

  if (isLoading || !conversation) {
    return <ChatPanelSkeleton />
  }

  const otherUser =
    conversation.buyerId === currentUserId ? conversation.seller : conversation.buyer
  const product = conversation.product
  const isSeller = conversation.sellerId === currentUserId
  const isArchived =
    conversation.buyerId === currentUserId
      ? !!conversation.buyerArchivedAt
      : !!conversation.sellerArchivedAt

  return (
    <>
      {showMarkSold && conversation && (
        <MarkAsSoldModal
          conversation={conversation}
          currentUserId={currentUserId}
          onClose={() => setShowMarkSold(false)}
          onSuccess={() => setShowMarkSold(false)}
        />
      )}
      {!reviewDismissed && restPendingReview && (
        <ReviewModal
          transaction={restPendingReview}
          currentUserId={currentUserId}
          onClose={() => {
            setReviewDismissed(true)
          }}
        />
      )}
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 md:hidden shrink-0"
        >
          <HiArrowLeft className="size-5" />
        </button>

        {/* Product */}
        <Link
          href={`/productos/${product.slug}`}
          className="flex items-center gap-2.5 flex-1 min-w-0 group"
        >
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="size-10 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <HiOutlinePhoto className="size-5 text-slate-300" />
            </div>
          )}
          <div className="min-w-0">
            <p className="txt-5 font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">
              {product.title}
            </p>
            <p className="txt-6 font-semibold text-green-700">
              ${Number(product.price).toLocaleString('es-MX')}
            </p>
          </div>
        </Link>

        {/* Other user */}
        <Link
          href={`/usuarios/${otherUser.id}`}
          className="flex items-center gap-2 shrink-0 group"
        >
          <p className="txt-6 font-semibold text-slate-700 group-hover:text-green-700 transition-colors truncate max-w-28 hidden sm:block">
            {otherUser.name}
          </p>
          {otherUser.photoUrl ? (
            <img
              src={otherUser.photoUrl}
              alt={otherUser.name}
              referrerPolicy="no-referrer"
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 txt-6 font-bold text-white">
              {otherUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Actions menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <HiEllipsisVertical className="size-5" />
          </button>
          {showActions && (
            <ChatActions
              conversationId={conversationId}
              isArchived={isArchived}
              isSeller={isSeller}
              productStatus={product.status ?? 'DISPONIBLE'}
              onClose={() => setShowActions(false)}
              onDeleted={onDeleted}
              onMarkAsSold={() => setShowMarkSold(true)}
            />
          )}
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isMine={msg.senderId === currentUserId}
            showAvatar={
              !(msg.senderId === currentUserId) &&
              (i === 0 || messages[i - 1]?.senderId !== msg.senderId)
            }
            isLast={
              i === messages.length - 1 || messages[i + 1]?.senderId !== msg.senderId
            }
            onReply={handleReply}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input ─── */}
      <div className="border-t border-slate-100 px-4 py-3">
        {/* Reply preview bar */}
        {reply && (
          <div className="mb-2.5 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
            <div className="w-[3px] self-stretch rounded-full bg-green-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-green-800 truncate leading-none mb-0.5">
                {reply.sender.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate leading-snug">
                {reply.content}
              </p>
            </div>
            <button
              onClick={() => setReply(null)}
              className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <HiXMark className="size-4" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Input
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            as="textarea"
            size="md"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-800 text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="w-7" />
      <div className="rounded-2xl bg-slate-100 px-4 py-2.5">
        <div className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-slate-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
