'use client'

import Link from 'next/link'
import { HiOutlineBell, HiCheck, HiOutlinePhoto } from 'react-icons/hi2'
import { cn, timeAgo } from '@/app/lib/utils'
import useClickOutside from '@/app/hooks/useClickOutside'
import { useNotifications } from '@/app/hooks/useNotifications'
import type { AppNotification } from '@/app/types/notification'

interface Props {
  compact: boolean
  onClose: () => void
}

export default function NotificationDropdown({ onClose }: Props) {
  const ref = useClickOutside<HTMLDivElement>(onClose)
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications()

  const handleClick = (notif: AppNotification) => {
    if (!notif.readAt) markRead(notif.id)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <p className="txt-5 font-bold text-slate-900">Notificaciones</p>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-700 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-1 txt-6 font-medium text-slate-400 hover:text-green-700 transition-colors"
          >
            <HiCheck className="size-3.5" />
            Todo leído
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[340px] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="size-5 animate-spin rounded-full border-2 border-slate-100 border-t-green-700" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10">
            <HiOutlineBell className="size-6 text-slate-200" />
            <p className="txt-6 text-slate-400">Sin notificaciones</p>
          </div>
        )}

        {notifications.map((notif) => {
          const firstName = notif.title.split(' ')[0]
          const unread = !notif.readAt

          return (
            <Link
              key={notif.id}
              href={notif.url}
              onClick={() => handleClick(notif)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50',
                unread && 'bg-green-50/50 hover:bg-green-50',
              )}
            >
              {/* Stacked avatar: product thumb + user photo */}
              <div className="relative size-10 shrink-0">
                {notif.imageUrl ? (
                  <img src={notif.imageUrl} className="size-10 rounded-xl object-cover" />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                    <HiOutlinePhoto className="size-4 text-slate-300" />
                  </div>
                )}
                {notif.avatarUrl ? (
                  <img
                    src={notif.avatarUrl}
                    referrerPolicy="no-referrer"
                    className="absolute -bottom-1 -right-1 size-4 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-slate-700 ring-2 ring-white text-[7px] font-bold text-white">
                    {firstName[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn('txt-5 truncate', unread ? 'font-semibold text-slate-900' : 'text-slate-600')}>
                    {firstName}
                  </p>
                  <span className="txt-6 shrink-0 text-slate-400">{timeAgo(notif.createdAt)}</span>
                </div>
                <p className="txt-6 text-slate-400 truncate">{notif.body}</p>
              </div>

              {/* Unread dot */}
              {unread && <span className="size-1.5 shrink-0 rounded-full bg-green-600" />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
