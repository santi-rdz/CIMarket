'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HiPaperAirplane, HiOutlineChatBubbleBottomCenterText, HiChevronRight } from 'react-icons/hi2'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import Input from '@/app/components/ui/Input'
import { useConversations, useCreateConversation } from '@/app/hooks/useConversations'
import { useMe } from '@/app/hooks/useMe'
import { useSocket } from '@/app/hooks/useSocket'
import type { ProductUser } from '@/app/types/product'

const QUICK_MESSAGES = [
  { label: '¿Disponible?', text: '¿Sigue disponible?' },
  { label: 'Negociar precio', text: '¿Cuánto es lo menos?' },
  { label: '¿Dónde nos vemos?', text: '¿Dónde nos vemos para la entrega?' },
]

interface Props {
  seller: ProductUser
  productId: string
}

export default function SellerCard({ seller, productId }: Props) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { data: me } = useMe()
  const { data: conversations } = useConversations()
  const createConversation = useCreateConversation()
  const socket = useSocket()

  const initials = seller.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Find existing conversation for this product+seller
  const existingConv = conversations?.find(
    (c) => c.product.id === productId && (c.buyerId === me?.id || c.sellerId === me?.id),
  )

  const handleSend = async () => {
    if (!message.trim() || !socket) {
      toast.error('Inicia sesión para enviar mensajes')
      return
    }

    setIsSending(true)
    try {
      const conversation = await createConversation.mutateAsync({
        sellerId: seller.id,
        productId,
      })

      socket.emit('join_conversation', conversation.id)
      socket.emit('send_message', { conversationId: conversation.id, content: message.trim() })

      const chatUrl = `/mensajes?chat=${conversation.id}`
      toast.success('Mensaje enviado', {
        action: {
          label: 'Ver chat',
          onClick: () => { window.location.href = chatUrl },
        },
      })
      setMessage('')
    } catch {
      // toastApiError already handles this in the hook
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <hr className="my-5 border-slate-100" />

      {/* Seller info */}
      <div className="flex items-center gap-3">
        {seller.photoUrl ? (
          <img
            src={seller.photoUrl}
            alt={seller.name}
            referrerPolicy="no-referrer"
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-slate-900 txt-6 font-bold text-white">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="txt-5 font-semibold text-slate-900">{seller.name}</p>
          <p className="txt-6 text-slate-400">Responde en ~1h</p>
        </div>
        <Link
          href={`/usuarios/${seller.id}`}
          className="txt-6 font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          Ver perfil
        </Link>
      </div>

      {/* Existing conversation shortcut */}
      {existingConv && (
        <Link
          href={`/mensajes?chat=${existingConv.id}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 transition-colors hover:bg-green-50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-green-100">
            <HiOutlineChatBubbleBottomCenterText className="size-4 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="txt-5 font-semibold text-green-800">Tienes una conversación activa</p>
            {existingConv.messages[0] && (
              <p className="txt-6 text-green-700/70 truncate">{existingConv.messages[0].content}</p>
            )}
          </div>
          <HiChevronRight className="size-4 shrink-0 text-green-400" />
        </Link>
      )}

      {/* Message input */}
      <div className="mt-4">
        <Input
          as="textarea"
          variant="outline"
          size="sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Quick replies */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {QUICK_MESSAGES.map((msg) => (
          <button
            key={msg.label}
            onClick={() => setMessage(msg.text)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 txt-6 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
          >
            {msg.label}
          </button>
        ))}
      </div>

      {/* Send */}
      <Button
        className="mt-4 w-full"
        icon={<HiPaperAirplane className="size-4" />}
        disabled={!message.trim()}
        isLoading={isSending}
        onClick={handleSend}
      >
        Enviar mensaje
      </Button>

      <p className="mt-3 text-center txt-6 leading-tight text-slate-300">
        CIMarket nunca cobra por transacciones entre usuarios.
      </p>
    </div>
  )
}
