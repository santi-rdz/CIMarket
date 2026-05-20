import Header from '../components/Header'
import MobileNav from '../components/MobileNav'
import PushSetup from '../components/PushSetup'

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PushSetup />
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </>
  )
}
