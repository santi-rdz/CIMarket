export type MessageSender = {
  id: string
  name: string
  photoUrl: string | null
}

export type MessageReply = {
  id: string
  content: string
  sender: { id: string; name: string }
}

export type Message = {
  id: string
  content: string
  senderId: string
  sender: MessageSender
  conversationId: string
  createdAt: string
  readAt: string | null
  replyTo: MessageReply | null
}

export type ConversationProduct = {
  id: string
  title: string
  slug: string
  price: string
  status: string
  images: { url: string }[]
}

export type Conversation = {
  id: string
  createdAt: string
  updatedAt: string
  buyerId: string
  sellerId: string
  buyerArchivedAt: string | null
  sellerArchivedAt: string | null
  buyer: MessageSender
  seller: MessageSender
  product: ConversationProduct
  messages: Pick<Message, 'id' | 'content' | 'createdAt' | 'senderId'>[]
  _count: { messages: number }
}

export type ConversationDetail = {
  id: string
  createdAt: string
  buyerId: string
  sellerId: string
  buyerArchivedAt: string | null
  sellerArchivedAt: string | null
  buyer: MessageSender & { email: string }
  seller: MessageSender & { email: string }
  product: ConversationProduct & { description: string; status: string }
  messages: Message[]
}

export type ReportReason = 'SPAM' | 'ACOSO' | 'FRAUDE' | 'CONTENIDO_INAPROPIADO' | 'OTRO'
