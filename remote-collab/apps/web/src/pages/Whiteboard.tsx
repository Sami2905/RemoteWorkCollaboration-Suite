import { Excalidraw, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/dist/excalidraw.min.css'
import { useEffect, useRef, useState } from 'react'
import throttle from 'lodash.throttle'
import { useSocket } from '../context/SocketProvider'

export default function Whiteboard() {
  const workspaceId = 'ws-demo-1'
  const socket = useSocket()
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const ignoreSource = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!socket) return
    socket.emit('whiteboard:request_state', { workspaceId })

    const onState = ({ elements, appState, files }: any) => {
      apiRef.current?.updateScene({ elements, appState, files })
    }
    const onRemote = ({ payload, from }: { payload: any; from: string }) => {
      ignoreSource.current = from
      apiRef.current?.updateScene(payload)
    }

    socket.on('whiteboard:state', onState)
    socket.on('whiteboard:update', onRemote)

    return () => {
      socket.off('whiteboard:state', onState)
      socket.off('whiteboard:update', onRemote)
    }
  }, [workspaceId])

  const broadcast = throttle((elements: any, appState: any, files: any) => {
    if (!socket) return
    socket.emit('whiteboard:update', { workspaceId, payload: { elements, appState, files } })
  }, 120)

  return (
    <div className="h-[70vh] rounded-xl overflow-hidden border">
      <Excalidraw
        excalidrawAPI={(api) => { apiRef.current = api; setReady(true) }}
        onChange={(elements, appState, files) => {
          if (!ready) return
          if (ignoreSource.current) { ignoreSource.current = null; return }
          broadcast(elements, appState, files)
        }}
      />
    </div>
  )
}


