'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMe } from '@/app/hooks/useMe'

export default function ProfileAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const { data: user, isLoading, isError } = useMe()

  useEffect(() => {
    function syncToken() {
      const token = localStorage.getItem('token')
      setHasToken(Boolean(token))
      if (!token) {
        router.replace('/login')
      }
    }

    syncToken()
    window.addEventListener('token-change', syncToken)
    window.addEventListener('storage', syncToken)
    return () => {
      window.removeEventListener('token-change', syncToken)
      window.removeEventListener('storage', syncToken)
    }
  }, [router])

  useEffect(() => {
    if (hasToken && isError) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('token-change'))
      router.replace('/login')
    }
  }, [hasToken, isError, router])

  if (hasToken === null || hasToken === false || isLoading || !user) {
    return <ProfileAuthSkeleton />
  }

  return <>{children}</>
}

function ProfileAuthSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="animate-pulse md:flex md:gap-12">
        <aside className="hidden w-48 shrink-0 space-y-3 md:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded-2xl bg-slate-100" />
          ))}
        </aside>
        <main className="min-w-0 flex-1 space-y-6">
          <div className="h-8 w-52 rounded bg-slate-100" />
          <div className="h-64 rounded-3xl bg-slate-100" />
        </main>
      </div>
    </div>
  )
}
