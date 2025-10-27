import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="p-6 text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}


