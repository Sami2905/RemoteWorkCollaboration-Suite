import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const loc = useLocation() as any
  const from = loc.state?.from?.pathname || '/'

  const onEmailPass = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    if (data.user) navigate(from, { replace: true })
  }

  const onMagicLink = async () => {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else alert('Magic link sent! Check your email.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p className="text-slate-500 mb-6">Welcome back to Collaboration Suite</p>
        <form onSubmit={onEmailPass} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="••••••••" required />
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button disabled={loading} className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 transition">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <button onClick={onMagicLink} className="mt-3 w-full text-sm text-indigo-600 hover:underline">Send magic link instead</button>
      </motion.div>
    </div>
  )
}


