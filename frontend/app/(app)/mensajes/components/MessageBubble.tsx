import { HiCheck } from 'react-icons/hi2'
import { cn } from '@/app/lib/utils'
import type { Message } from '@/app/types/conversation'

interface Props {
  msg: Message
  isMine: boolean
  showAvatar: boolean
  isLast: boolean
}

export function MessageBubble({ msg, isMine, showAvatar, isLast }: Props) {
  return (
    <div className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
      {/* Avatar (other user only) */}
      {!isMine && (
        <div className="w-7 shrink-0">
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

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 txt-5',
          isMine
            ? 'bg-green-800 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md',
          isLast ? 'mb-2' : 'mb-0.5',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

        {/* Time + read receipt */}
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
    </div>
  )
}
