import { useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { useAuth } from '../features/auth/AuthProvider'
import { WebsocketProvider } from 'y-websocket'
import throttle from 'lodash.throttle'

type Props = { docId: string; user?: { name: string; color?: string } }

export function DocEditorTipTap({ docId, user = { name: 'Alex Rivera', color: '#6366f1' } }: Props) {
  const { accessToken } = useAuth()
  const ydoc = useMemo(() => new Y.Doc(), [])
  const base = import.meta.env.VITE_API_URL_HTTP ?? 'http://localhost:8081'

  useEffect(() => {
    let canceled = false

    // 1) Restore latest state BEFORE connecting provider
    ;(async () => {
      const headers: any = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      const r = await fetch(`${base}/documents/${docId}/state`, { headers })
      if (r.ok) {
        const json = await r.json()
        if (json.updateB64) {
          const buf = Uint8Array.from(atob(json.updateB64), c => c.charCodeAt(0))
          Y.applyUpdate(ydoc, buf)
        }
      }
    })().finally(() => {
      if (canceled) return

      // 2) Connect Yjs provider after local state
      const provider = new WebsocketProvider(import.meta.env.VITE_YJS_WS_URL ?? 'ws://localhost:1234', `doc-${docId}`, ydoc)

      // 3) TipTap editor
      const editor = useEditor({
        extensions: [
          StarterKit.configure({ history: false }),
          Collaboration.configure({ document: ydoc as unknown as any }),
          CollaborationCursor.configure({
            provider,
            user: { name: user.name, color: user.color || '#6366f1' },
          }) as any,
        ],
        editorProps: {
          attributes: { class: 'prose prose-slate max-w-none bg-white rounded-2xl p-4 focus:outline-none' }
        }
      })

      // 4) Throttled minimal updates (state-vector diff)
      const pushUpdate = throttle(async () => {
        if (!accessToken) return
        try {
          const hv = await fetch(`${base}/documents/${docId}/state/vector`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
          if (!hv.ok) return
          const { svB64 } = await hv.json()
          const sv = svB64
            ? Uint8Array.from(atob(svB64), c => c.charCodeAt(0))
            : Y.encodeStateVector(new Y.Doc()) // server empty => send full state
          const diff = Y.encodeStateAsUpdate(ydoc, sv)
          if (diff.byteLength === 0) return
          const updateB64 = btoa(String.fromCharCode(...diff))
          await fetch(`${base}/documents/${docId}/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ updateB64 })
          })
        } catch {
          // ignore transient failures
        }
      }, 10000) // 10s throttle

      ydoc.on('update', pushUpdate)

      return () => {
        canceled = true
        ydoc.off('update', pushUpdate)
        provider.destroy()
        editor?.destroy()
      }
    })

    return () => { canceled = true }
  }, [docId, accessToken, base, user?.name, user?.color, ydoc])

  // Placeholder editor for rendering
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none bg-white rounded-2xl p-4 focus:outline-none' }
    }
  })

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <EditorContent editor={editor} />
    </div>
  )
}


