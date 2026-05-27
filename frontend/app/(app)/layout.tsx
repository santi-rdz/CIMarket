import Header from '../components/Header'
import MobileNav from '../components/MobileNav'
import PushSetup from '../components/PushSetup'
import CampusSetupGuard from '../components/CampusSetupGuard'
import { ReviewProvider } from '../context/ReviewContext'

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReviewProvider>
      <PushSetup />
      <CampusSetupGuard />
      <Header />
      <main className="pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </ReviewProvider>
  )
}
