'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  HiCheck,
  HiArrowUturnLeft,
  HiOutlineTrash,
  HiOutlineClipboardDocument,
} from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import { useLongPress } from '@/app/hooks/useLongPress'
import type { Message, MessageReply } from '@/app/types/conversation'

interface Props {
  msg: Message
  isMine: boolean
  showAvatar: boolean
  isLast: boolean
  onReply: (reply: MessageReply) => void
}

// ─── Shared bubble content ────────────────────────────────────────────────────

function BubbleContent({ msg, isMine }: { msg: Message; isMine: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl px-3.5 py-2 txt-5',
        isMine
          ? 'bg-green-800 text-white rounded-br-md'
          : 'bg-slate-100 text-slate-900 rounded-bl-md',
      )}
    >
      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
      <div className="flex items-center justify-end gap-1 mt-0.5">
        <span className={cn('txt-6', isMine ? 'text-white/50' : 'text-slate-400')}>
          {new Date(msg.createdAt).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {isMine &&
          (msg.readAt ? (
            <span className="flex items-center gap-0.5 text-emerald-300">
              <HiCheck className="size-3.5 -mr-2" />
              <HiCheck className="size-3.5" />
            </span>
          ) : (
            <HiCheck className="size-3.5 text-white/30" />
          ))}
      </div>
    </div>
  )
}

// ─── Context menu overlay (portal) ───────────────────────────────────────────

const OVERLAY_EDGE = 8
const MENU_GAP = 10
const MENU_WIDTH = 220
const SCREEN_PADDING = 16
const CLOSE_DURATION = 150 // ms — matches animate-menu-out duration

interface OverlayProps {
  msg: Message
  isMine: boolean
  rect: DOMRect
  onReply: () => void
  onCopy: () => void
  onDelete: () => void
  onClose: () => void
}

function ContextMenuOverlay({
  msg, isMine, rect, onReply, onCopy, onDelete, onClose,
}: OverlayProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [bubbleTop, setBubbleTop] = useState(rect.top)
  const [menuTop, setMenuTop] = useState(rect.bottom + MENU_GAP)
  const [phase, setPhase] = useState<'measuring' | 'open' | 'closing'>('measuring')

  // Measure real menu height, correct positions, then animate in
  useLayoutEffect(() => {
    if (!menuRef.current) return
    const menuHeight = menuRef.current.offsetHeight
    const wouldClip = rect.bottom + MENU_GAP + menuHeight + SCREEN_PADDING > window.innerHeight

    if (wouldClip) {
      const newTop = Math.max(
        SCREEN_PADDING,
        window.innerHeight - SCREEN_PADDING - rect.height - MENU_GAP - menuHeight,
      )
      setBubbleTop(newTop)
      setMenuTop(newTop + rect.height + MENU_GAP)
    }

    setPhase('open')
  }, [rect])

  // Animate menu out, then close — bubble fades back in via CSS opacity transition
  function requestClose(afterAction?: () => void) {
    setPhase('closing')
    setTimeout(() => {
      afterAction?.()
      onClose()
    }, CLOSE_DURATION)
  }

  const edgeStyle = isMine
    ? { right: OVERLAY_EDGE, left: 'auto' as const }
    : { left: OVERLAY_EDGE, right: 'auto' as const }

  const menuClass = cn(
    'fixed z-50 rounded-2xl border overflow-hidden border-slate-200 bg-white text-slate-800 shadow-md',
    isMine ? 'origin-top-right' : 'origin-top-left',
    phase === 'measuring' && 'opacity-0',
    phase === 'open'      && 'animate-menu-in',
    phase === 'closing'   && 'animate-menu-out',
  )

  const backdropClass = cn(
    'fixed inset-0 z-50 bg-black/25 backdrop-blur-sm transition-opacity duration-150',
    phase === 'closing' ? 'opacity-0' : 'opacity-100',
  )

  const item = 'flex items-center gap-4 w-full px-5 py-3.5 txt-5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100'

  return createPortal(
    <>
      <div className={backdropClass} onClick={() => requestClose()} />

      {/* Bubble clone */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{ top: bubbleTop, width: rect.width, viewTransitionName: 'active-bubble', ...edgeStyle }}
      >
        <BubbleContent msg={msg} isMine={isMine} />
      </div>

      {/* Menu card */}
      <div
        ref={menuRef}
        className={menuClass}
        style={{ top: menuTop, width: MENU_WIDTH, ...edgeStyle }}
      >
        <p className="px-5 pt-3.5 pb-1 txt-6 text-slate-400 font-medium">
          {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="py-1">
          <button onClick={() => requestClose(onReply)} className={item}>
            <HiArrowUturnLeft className="size-5 text-slate-500 shrink-0" />
            <span className="text-slate-700 font-medium">Responder</span>
          </button>
          <button onClick={() => requestClose(onCopy)} className={item}>
            <HiOutlineClipboardDocument className="size-5 text-slate-500 shrink-0" />
            <span className="text-slate-700 font-medium">Copiar</span>
          </button>
          {isMine && (
            <>
              <div className="mx-4 my-1 border-t border-slate-100" />
              <button onClick={() => requestClose(onDelete)} className={cn(item, 'hover:bg-red-50 active:bg-red-100')}>
                <HiOutlineTrash className="size-5 text-red-500 shrink-0" />
                <span className="text-red-500 font-medium">Eliminar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

export function MessageBubble({ msg, isMine, showAvatar, isLast, onReply }: Props) {
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const replyPayload: MessageReply = { id: msg.id, content: msg.content, sender: msg.sender }

  const longPress = useLongPress(() => {
    if (!bubbleRef.current) return
    const el = bubbleRef.current
    const rect = el.getBoundingClientRect()

    const open = () => setMenuRect(rect)

    if ('startViewTransition' in document) {
      el.style.viewTransitionName = 'active-bubble'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(document as any).startViewTransition(open).finished.then(() => {
        el.style.viewTransitionName = ''
      })
    } else {
      open()
    }
  })

  function handleReply()  { onReply(replyPayload) }
  function handleCopy()   { void navigator.clipboard.writeText(msg.content) }
  function handleDelete() { /* TODO */ }
  function handleClose()  { setMenuRect(null) }

  return (
    <>
      {menuRect && (
        <ContextMenuOverlay
          msg={msg}
          isMine={isMine}
          rect={menuRect}
          onReply={handleReply}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      )}

      <div
        className={cn(
          'group flex items-end gap-2',
          isMine ? 'justify-end' : 'justify-start',
          isLast ? 'mb-2' : 'mb-0.5',
        )}
      >
        {/* Avatar */}
        {!isMine && (
          <div className="w-7 shrink-0 self-end mb-0.5">
            {showAvatar &&
              (msg.sender?.photoUrl ? (
                <img
                  src={msg.sender.photoUrl}
                  alt={msg.sender.name}
                  referrerPolicy="no-referrer"
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
                  {msg.sender?.name?.slice(0, 1) ?? '?'}
                </div>
              ))}
          </div>
        )}

        {/* Desktop reply button (mine) */}
        {isMine && (
          <button
            onClick={() => onReply(replyPayload)}
            className="self-end mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 hidden md:flex"
          >
            <HiArrowUturnLeft className="size-3.5" />
          </button>
        )}

        {/* Bubbles column */}
        <div className={cn('flex flex-col max-w-[75%]', isMine ? 'items-end' : 'items-start')}>
          {msg.replyTo && (
            <>
              <p className="txt-6 text-slate-400 mb-1 px-1">
                {isMine ? 'Respondiste' : `${msg.sender.name} respondió`}
              </p>
              <div className={cn('mb-4 flex items-stretch gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
                <div className="w-[3px] shrink-0 rounded-full bg-green-700 opacity-40" />
                <div className="rounded-2xl bg-green-100 px-3.5 py-2">
                  <p className="text-[12px] leading-snug line-clamp-2 text-green-900/80">
                    {msg.replyTo.content}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Main bubble — invisible while menu is open (clone shown in portal) */}
          <div
            ref={bubbleRef}
            {...longPress}
            className="select-none"
            style={{
              opacity: menuRect ? 0 : 1,
              transition: menuRect ? 'none' : 'opacity 0.15s ease',
            }}
          >
            <BubbleContent msg={msg} isMine={isMine} />
          </div>
        </div>

        {/* Desktop reply button (theirs) */}
        {!isMine && (
          <button
            onClick={() => onReply(replyPayload)}
            className="self-end mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 hidden md:flex"
          >
            <HiArrowUturnLeft className="size-3.5" />
          </button>
        )}
      </div>
    </>
  )
}
