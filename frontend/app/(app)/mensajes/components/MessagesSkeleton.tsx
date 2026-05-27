function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ''}`} />
}

function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="relative size-11 shrink-0">
        <SkeletonBox className="size-11 rounded-xl" />
        <SkeletonBox className="absolute -bottom-1 -right-1 size-5 rounded-full ring-2 ring-white" />
      </div>
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3.5 w-2/3" />
        <SkeletonBox className="h-3 w-4/5" />
      </div>
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 pt-4 pb-0">
        <SkeletonBox className="h-5 w-28 mb-4" />
        <div className="flex gap-4">
          <SkeletonBox className="h-3 w-14 mb-3" />
          <SkeletonBox className="h-3 w-20 mb-3" />
        </div>
      </div>
      {/* Items */}
      <div>
        {Array.from({ length: 6 }).map((_, i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function MessageBubbleSkeleton({ isMine, width }: { isMine: boolean; width: string }) {
  return (
    <div className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && <SkeletonBox className="size-7 shrink-0 rounded-full" />}
      <SkeletonBox className={`h-10 rounded-2xl ${width}`} />
    </div>
  )
}

export function ChatPanelSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <SkeletonBox className="size-10 shrink-0 rounded-xl" />
          <div className="space-y-2 min-w-0">
            <SkeletonBox className="h-3.5 w-28" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SkeletonBox className="h-3 w-20 hidden sm:block" />
          <SkeletonBox className="size-9 rounded-full" />
        </div>
        <SkeletonBox className="size-8 shrink-0 rounded-full" />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 px-4 py-4">
        <MessageBubbleSkeleton isMine={false} width="w-48" />
        <MessageBubbleSkeleton isMine={true} width="w-56" />
        <MessageBubbleSkeleton isMine={true} width="w-36" />
        <MessageBubbleSkeleton isMine={false} width="w-64" />
        <MessageBubbleSkeleton isMine={false} width="w-40" />
        <MessageBubbleSkeleton isMine={true} width="w-52" />
        <MessageBubbleSkeleton isMine={true} width="w-44" />
        <MessageBubbleSkeleton isMine={false} width="w-48" />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <SkeletonBox className="h-10 flex-1 rounded-2xl" />
          <SkeletonBox className="size-10 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  )
}
