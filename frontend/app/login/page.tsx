import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'

export default function LoginPage() {
  return (
    <main className="grid grid-cols-[35fr_65fr] min-h-dvh">
      <LeftPanel />
      <RightPanel />
    </main>
  )
}
