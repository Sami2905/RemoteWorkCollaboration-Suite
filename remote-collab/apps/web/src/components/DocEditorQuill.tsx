import { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Quill from 'quill'
import { QuillBinding } from 'y-quill'
import 'quill/dist/quill.snow.css'

type Props = { docId: string }

export function DocEditorQuill({ docId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const editorEl = document.createElement('div')
    editorEl.className = 'bg-white rounded-xl shadow p-2'
    containerRef.current.appendChild(editorEl)

    const quill = new Quill(editorEl, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'code'],
          ['clean'],
        ],
      },
    })

    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider(
      import.meta.env.VITE_YJS_URL ?? 'ws://localhost:1234',
      `doc-${docId}`,
      ydoc,
    )
    const ytext = ydoc.getText('quill')

    const binding = new QuillBinding(ytext, quill, provider.awareness)
    provider.awareness.setLocalStateField('user', { name: 'Alex Rivera', color: '#6366f1' })

    return () => {
      binding.destroy()
      provider.destroy()
      ydoc.destroy()
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [docId])

  return <div ref={containerRef} className="rounded-2xl bg-slate-50 p-4" />
}


