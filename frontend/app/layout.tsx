import type { Metadata } from 'next'

import './index.css'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CIMarket',
  description:
    'Compra y Venta de articulos de segunda mano en UABC - Universidad Autónoma de Baja California',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-dvh ">{children}</body>
    </html>
  )
}
