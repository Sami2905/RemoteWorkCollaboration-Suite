import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Quill from 'quill'
import 'react-quill-new/dist/quill.snow.css'

export function DocEditor({ docId }: { docId: string }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!container) return
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:1234', `doc-${docId}`, ydoc)
    const ytext = ydoc.getText('quill')

    const quillDiv = document.createElement('div')
    container.appendChild(quillDiv)
    const quill = new Quill(quillDiv, { theme: 'snow' })

    const applyDelta = () => {
      quill.setText(ytext.toString())
    }
    ytext.observe(applyDelta)
    quill.on('text-change', () => {
      const text = quill.getText()
      ytext.delete(0, ytext.length)
      ytext.insert(0, text)
    })

    return () => {
      ytext.unobserve(applyDelta)
      provider.destroy()
      ydoc.destroy()
      container.innerHTML = ''
    }
  }, [container, docId])

  return <div ref={setContainer} className="rounded-xl bg-white shadow-card p-4" />
}


