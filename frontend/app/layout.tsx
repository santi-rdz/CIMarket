import type { Metadata } from 'next'

import './index.css'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { SITE_URL } from './lib/constants'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CIMarket — Compra y venta entre estudiantes UABC',
    template: '%s | CIMarket',
  },
  description:
    'Marketplace universitario de la UABC. Compra y vende artículos de segunda mano entre estudiantes de forma segura y rápida.',
  keywords: [
    'UABC',
    'cimarket',
    'marketplace',
    'compra venta',
    'segunda mano',
    'universitario',
    'Baja California',
    'estudiantes',
  ],
  authors: [{ name: 'CIMarket' }],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'CIMarket',
    title: 'CIMarket — Compra y venta entre estudiantes UABC',
    description:
      'Marketplace universitario de la UABC. Compra y vende artículos de segunda mano entre estudiantes.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="min-h-dvh ">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#1e293b',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderRadius: '1rem',
            },
            unstyled: false,
          }}
        />
      </body>
    </html>
  )
}
