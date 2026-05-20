import { Suspense } from 'react'
import type { Metadata } from 'next'
import MessagesClient from './components/MessagesClient'

export const metadata: Metadata = {
  title: 'Mensajes',
  description: 'Tus conversaciones en CIMarket.',
}

export default function MensajesPage() {
  return (
    <Suspense>
      <MessagesClient />
    </Suspense>
  )
}
