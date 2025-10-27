import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthProvider'
import { useSocket } from '../../context/SocketProvider'

export type ChatMessage = {
  id: string
  content: string
  userId: string
  workspaceId: string
  createdAt: string
}

export function useChat(workspaceId: string) {
  const qc = useQueryClient()
  const socket = useSocket()
  const { accessToken } = useAuth()

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['messages', workspaceId],
    queryFn: async () => {
      const base = import.meta.env.VITE_API_URL_HTTP ?? 'http://localhost:8081'
      const res = await fetch(`${base}/workspaces/${workspaceId}/messages`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
      const body = await res.json()
      // API now returns { data, nextCursor }
      return Array.isArray(body) ? body : (body.data ?? [])
    },
    enabled: Boolean(workspaceId && accessToken),
  })

  useEffect(() => {
    if (!socket || !workspaceId) return

    const onNew = (msg: ChatMessage) => {
      qc.setQueryData<ChatMessage[]>(['messages', workspaceId], (prev = []) => [...prev, msg])
    }

    socket.on('chat:new', onNew)

    return () => {
      socket.off('chat:new', onNew)
    }
  }, [socket, workspaceId, qc])

  const send = (content: string) => {
    if (!content.trim() || !socket) return
    socket.emit('chat:send', { workspaceId, content })
  }

  return { messages, send }
}


