import { createContext, useContext, useEffect, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../features/auth/AuthProvider'

const Ctx = createContext<Socket | null>(null)
export const useSocket = () => useContext(Ctx)

export function SocketProvider({ children, workspaceId }: { children: React.ReactNode; workspaceId: string }) {
  const { accessToken } = useAuth()
  const socket = useMemo(() => {
    const s = io(import.meta.env.VITE_API_URL ?? 'http://localhost:8081', {
      transports: ['websocket'],
      autoConnect: false,
      auth: accessToken ? { token: accessToken } : undefined
    })
    return s
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return
    socket.connect()
    socket.emit('join_workspace', workspaceId)
    return () => { socket.disconnect() }
  }, [socket, accessToken, workspaceId])

  return <Ctx.Provider value={socket}>{children}</Ctx.Provider>
}
