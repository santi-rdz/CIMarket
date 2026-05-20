import type { Metadata } from 'next'
import ProfileSidebar from './components/ProfileSidebar'

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false, follow: false },
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      {/* Mobile: horizontal tab bar */}
      <div className="mb-6 md:hidden">
        <ProfileSidebar variant="tabs" />
      </div>

      {/* Desktop: sidebar + content */}
      <div className="md:flex md:gap-12">
        <aside className="hidden md:block w-48 shrink-0">
          <ProfileSidebar variant="sidebar" />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
