import { Link, NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SocketProvider } from '../context/SocketProvider'
import { useAuth } from '../features/auth/AuthProvider'
import { supabase } from '../lib/supabase'
import { usePresenceWithProfiles } from '../features/presence/usePresenceWithProfiles'
import { NotificationsProvider } from '../features/notifications/NotificationsProvider'
import { useState, useEffect, useRef } from 'react'

export default function AppLayout() {
  const { user } = useAuth()
  // For demo, use a fixed workspace ID. In production, derive from user's memberships
  const workspaceId = 'ws-demo-1'
  const { userIds, profiles } = usePresenceWithProfiles(workspaceId)
  const [showPresencePopover, setShowPresencePopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPresencePopover(false)
      }
    }
    if (showPresencePopover) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPresencePopover])

  return (
    <SocketProvider workspaceId={workspaceId}>
      <NotificationsProvider>
      <div className="min-h-full grid grid-cols-[260px_1fr]">
        <aside className="border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="h-16 flex items-center px-4 border-b">
            <Link to="/" className="font-semibold text-brand-600">Collab Suite</Link>
          </div>
          <nav className="p-3 space-y-1">
            {[
              ['/', 'Home'],
              ['/documents', 'Documents'],
              ['/whiteboard', 'Whiteboard'],
              ['/tasks', 'Tasks'],
              ['/chat', 'Chat'],
              ['/video', 'Video'],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `block px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-100'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 mt-auto">
            <div className="text-xs text-slate-500 mb-2">{user?.email}</div>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </aside>
        <main className="min-h-full">
          <div className="h-16 border-b flex items-center px-6 justify-between">
            <div />
            <div className="flex items-center gap-2">
              <div className="relative" ref={popoverRef}>
                <button 
                  onClick={() => setShowPresencePopover(!showPresencePopover)}
                  className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-sm hover:bg-emerald-100 transition-colors"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{userIds.length} online</span>
                </button>
                {/* Presence popover */}
                {showPresencePopover && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2 z-50">
                    {userIds.length === 0 ? (
                      <div className="text-sm text-slate-500 p-2">No one online</div>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {userIds.map(id => {
                          const p = profiles[id]
                          return (
                            <li key={id} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-slate-50">
                              <img
                                src={p?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p?.name || p?.email || id)}`}
                                alt=""
                                className="h-6 w-6 rounded-full border"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">{p?.name || p?.email || id}</div>
                                <div className="text-xs text-slate-500 truncate">{p?.email}</div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      </NotificationsProvider>
    </SocketProvider>
  )
}


