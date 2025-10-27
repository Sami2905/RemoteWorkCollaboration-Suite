import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useSocket } from '../../context/SocketProvider'

export function usePresence(workspaceId: string) {
  const { accessToken } = useAuth()
  const socket = useSocket()
  const [users, setUsers] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      if (!accessToken) return
      const base = import.meta.env.VITE_API_URL_HTTP ?? 'http://localhost:8081'
      const res = await fetch(`${base}/workspaces/${workspaceId}/presence`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!mounted) return
      if (res.ok) {
        const json = await res.json()
        setUsers(json.users || [])
      }
    })()

    const onUpdate = ({ workspaceId: ws, users }: { workspaceId: string; users: string[] }) => {
      if (ws === workspaceId) setUsers(users)
    }
    socket?.on('presence:update', onUpdate)

    return () => {
      mounted = false
      socket?.off('presence:update', onUpdate)
    }
  }, [workspaceId, socket, accessToken])

  return { users }
}


