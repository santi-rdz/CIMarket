import type { Metadata } from 'next'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Inicia sesión en CIMarket con tu cuenta de Google institucional para comprar y vender artículos en la UABC.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col md:grid md:grid-cols-[35fr_65fr]">
      <LeftPanel />
      <RightPanel />
    </main>
  )
}
