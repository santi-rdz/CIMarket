'use client'

import { useMemo } from 'react'
import { useMe } from './useMe'
import { useMyPreferences } from './useProfile'

/** Returns the user's preferred campus IDs from preferences */
export function useDefaultCampuses(): number[] {
  const { data: me } = useMe()
  const { data: prefs } = useMyPreferences()

  return useMemo(() => {
    if (!me || !prefs) return []
    return prefs.defaultCampuses.map((c) => c.id)
  }, [me, prefs])
}
