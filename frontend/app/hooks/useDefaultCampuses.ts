'use client'

import { useMemo } from 'react'
import { useMe } from './useMe'
import { useMyProfile, useMyPreferences } from './useProfile'

/** Returns the user's campus + preference campuses as a deduplicated array of IDs */
export function useDefaultCampuses(): number[] {
  const { data: me } = useMe()
  const { data: profile } = useMyProfile()
  const { data: prefs } = useMyPreferences()

  return useMemo(() => {
    if (!me) return []
    const ids = new Set<number>()
    if (profile?.campus?.id) ids.add(profile.campus.id)
    if (prefs?.defaultCampuses) {
      for (const c of prefs.defaultCampuses) ids.add(c.id)
    }
    return [...ids]
  }, [me, profile, prefs])
}
