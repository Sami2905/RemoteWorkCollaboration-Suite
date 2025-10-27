import { useState } from 'react'
import { useChat } from '../features/chat/useChat'
import { useAuth } from '../features/auth/AuthProvider'

export default function Chat() {
  const workspaceId = 'ws-demo-1'
  const { user } = useAuth()
  const userId = user?.id || 'anonymous'
  const { messages, send } = useChat(workspaceId)
  const [input, setInput] = useState('')

  return (
    <div className="h-full flex flex-col rounded-xl bg-white shadow-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`max-w-lg ${m.userId===userId ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100'} rounded-xl px-4 py-2 shadow`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="border-t p-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key==='Enter') { send(input); setInput('') } }}
          placeholder="Type message…"
        />
        <button onClick={() => { send(input); setInput('') }} className="rounded-xl bg-indigo-600 text-white px-4 py-2">Send</button>
      </div>
    </div>
  )
}


