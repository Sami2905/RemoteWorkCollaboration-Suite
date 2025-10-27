import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import { useAuth } from '../auth/AuthProvider'
import { useSocket } from '../../context/SocketProvider'

type ChatMessage = {
  id: string
  content: string
  userId: string
  workspaceId: string
  createdAt: string
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket()
  const { user } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!socket) return

    const onChatNew = (msg: ChatMessage) => {
      if (msg.userId === user?.id) return
      if (pathname.startsWith('/chat')) return
      toast((t) => (
        <div className="text-sm">
          <div className="font-medium text-slate-900">New message</div>
          <div className="text-slate-700 line-clamp-2">{msg.content}</div>
          <button
            className="mt-2 rounded-md bg-indigo-600 text-white px-3 py-1 text-xs"
            onClick={() => {
              window.location.href = '/chat'
              toast.dismiss(t.id)
            }}
          >
            View
          </button>
        </div>
      ), { duration: 4000 })
    }

    socket.on('chat:new', onChatNew)
    return () => {
      socket.off('chat:new', onChatNew)
    }
  }, [socket, user?.id, pathname])

  return (
    <>
      <Toaster position="bottom-right" />
      {children}
    </>
  )
}


