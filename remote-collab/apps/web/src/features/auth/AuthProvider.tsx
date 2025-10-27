import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type AuthCtx = { user: any | null; loading: boolean; accessToken: string | null }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, accessToken: null })
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAccessToken(data.session?.access_token ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      setAccessToken(session?.access_token ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  return <Ctx.Provider value={{ user, loading, accessToken }}>{children}</Ctx.Provider>
}


