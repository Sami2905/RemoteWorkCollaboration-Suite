import { useEffect, useMemo, useState } from 'react'
import { usePresence } from './usePresence'
import { useAuth } from '../auth/AuthProvider'

type Profile = { id: string; name?: string; email?: string; imageUrl?: string }

export function usePresenceWithProfiles(workspaceId: string) {
  const { users } = usePresence(workspaceId) // returns userIds[]
  const { accessToken } = useAuth()
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})

  const uniqueIds = useMemo(() => Array.from(new Set(users)), [users])

  useEffect(() => {
    let canceled = false
    ;(async () => {
      if (!uniqueIds.length || !accessToken) { setProfiles({}); return }
      const base = import.meta.env.VITE_API_URL_HTTP ?? 'http://localhost:8081'
      const res = await fetch(`${base}/profiles?ids=${uniqueIds.join(',')}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!canceled && res.ok) {
        const list: Profile[] = await res.json()
        setProfiles(Object.fromEntries(list.map(u => [u.id, u])))
      }
    })()
    return () => { canceled = true }
  }, [uniqueIds, accessToken])

  return { userIds: uniqueIds, profiles }
}
