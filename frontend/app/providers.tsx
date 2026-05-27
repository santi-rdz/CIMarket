'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RealtimeEventsProvider } from './context/RealtimeEventsProvider'
import { SocketProvider } from './context/SocketContext'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <RealtimeEventsProvider>{children}</RealtimeEventsProvider>
      </SocketProvider>
    </QueryClientProvider>
  )
}
