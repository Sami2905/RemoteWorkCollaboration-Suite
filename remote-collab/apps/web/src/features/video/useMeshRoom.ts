import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import Peer, { Instance as SimplePeer } from 'simple-peer'

type RemotePeer = { id: string; stream: MediaStream | null }

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL
    ? [{
        urls: import.meta.env.VITE_TURN_URL,
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL
      } as RTCIceServer]
    : [])
]

export function useMeshRoom(userLabel: string) {
  const [joined, setJoined] = useState(false)
  const [roomId, setRoomId] = useState<string>('')
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([])
  const [muted, setMuted] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaMode, setMediaMode] = useState<'camera'|'audio-only'|'none'>('none')

  const socketRef = useRef<Socket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, SimplePeer>>(new Map())
  const myIdRef = useRef<string>('')

  const signaling = useMemo(() => {
    const url = import.meta.env.VITE_SIGNALING_URL ?? 'http://localhost:8082'
    return io(url, { transports: ['websocket'], autoConnect: false })
  }, [])

  const cleanupPeer = useCallback((id: string) => {
    const p = peersRef.current.get(id)
    if (p) {
      p.removeAllListeners()
      try { p.destroy() } catch {}
      peersRef.current.delete(id)
    }
    setRemotePeers(prev => prev.filter(r => r.id !== id))
  }, [])

  const addRemoteStream = useCallback((id: string, stream: MediaStream) => {
    setRemotePeers(prev => {
      const exists = prev.find(p => p.id === id)
      if (exists) return prev.map(p => (p.id === id ? { ...p, stream } : p))
      return [...prev, { id, stream }]
    })
  }, [])

  const createPeer = useCallback((remoteId: string, initiator: boolean) => {
    if (peersRef.current.has(remoteId)) return peersRef.current.get(remoteId)!
    const p = new Peer({
      initiator,
      trickle: true,
      stream: localStreamRef.current || undefined,
      config: { iceServers: ICE_SERVERS }
    })

    const pc = (p as any)._pc as RTCPeerConnection
    if (pc && pc.addEventListener) {
      pc.addEventListener('iceconnectionstatechange', () => {
        const st = pc.iceConnectionState
        if (st === 'failed' || st === 'disconnected') {
          try { ;(p as any).restartIce?.() } catch {}
        }
      })
    }

    p.on('signal', (signal) => {
      // Target the specific peer
      socketRef.current?.emit('signal', {
        to: remoteId,
        data: signal,
        room: roomId
      })
    })

    p.on('stream', (stream: MediaStream) => {
      addRemoteStream(remoteId, stream)
    })

    p.on('connect', () => {
      // Optional: DataChannel can be used for chat/control
    })

    p.on('close', () => cleanupPeer(remoteId))
    p.on('error', () => cleanupPeer(remoteId))

    peersRef.current.set(remoteId, p)
    return p
  }, [addRemoteStream, cleanupPeer, roomId])

  const getCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    setMediaMode('camera'); return s
  }
  const getAudioOnly = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
    setMediaMode('audio-only'); return s
  }

  const attachLocalStream = (s: MediaStream) => {
    localStreamRef.current = s
    s.getAudioTracks().forEach(t => (t.enabled = true))
    s.getVideoTracks().forEach(t => (t.enabled = mediaMode !== 'audio-only'))
    setMuted(false)
    setVideoEnabled(mediaMode !== 'audio-only')
  }

  const rejoin = useCallback(async () => {
    peersRef.current.forEach((p) => { try { p.destroy() } catch {} })
    peersRef.current.clear()
    setRemotePeers([])
    try {
      const s = await getCamera()
      attachLocalStream(s)
      setMediaError(null)
    } catch (e: any) {
      try {
        const s = await getAudioOnly()
        attachLocalStream(s)
        setMediaError(null)
      } catch (err) {
        setMediaError('Permissions denied for camera/microphone')
        setMediaMode('none')
        return
      }
    }
    const room = roomId
    if (room && socketRef.current?.connected) {
      socketRef.current.emit('join', room)
    }
  }, [roomId, mediaMode])

  const join = useCallback(async (room: string) => {
    if (joined) return
    setMediaError(null)
    try {
      const stream = await getCamera()
      attachLocalStream(stream)
    } catch (e) {
      try {
        const stream = await getAudioOnly()
        attachLocalStream(stream)
      } catch (err) {
        setMediaError('Please allow microphone/camera to join the call.')
        return
      }
    }

    // Connect signaling
    socketRef.current = signaling
    if (!socketRef.current.connected) socketRef.current.connect()

    socketRef.current.on('connect', () => {
      myIdRef.current = socketRef.current!.id
      setRoomId(room)
      socketRef.current!.emit('join', room)

      // Server will send us existing peers via 'peers' event
      setJoined(true)
    })

    // Handle server-driven peer lifecycle
    socketRef.current.on('peers', (ids: string[]) => {
      ids.forEach(remoteId => {
        if (remoteId === myIdRef.current) return
        const p = createPeer(remoteId, true) // initiator
        peersRef.current.set(remoteId, p)
      })
    })

    socketRef.current.on('user-joined', (remoteId: string) => {
      if (remoteId === myIdRef.current) return
      if (!peersRef.current.get(remoteId)) {
        const p = createPeer(remoteId, true)
        peersRef.current.set(remoteId, p)
      }
    })

    socketRef.current.on('user-left', (remoteId: string) => {
      cleanupPeer(remoteId)
    })

    socketRef.current.on('signal', ({ from, data }: any) => {
      if (from === myIdRef.current) return
      let peer = peersRef.current.get(from)
      if (!peer) {
        peer = createPeer(from, false) // responder
        peersRef.current.set(from, peer)
      }
      try {
        peer.signal(data)
      } catch (e) {
        console.warn('signal error, recreating peer', e)
        cleanupPeer(from)
        const p = createPeer(from, false)
        peersRef.current.set(from, p)
        p.signal(data)
      }
    })

    // Optional: clean when signaling disconnects
    socketRef.current.on('disconnect', () => {
      peersRef.current.forEach((_p, id) => cleanupPeer(id))
      peersRef.current.clear()
      setRemotePeers([])
      setJoined(false)
    })
  }, [createPeer, cleanupPeer, joined, signaling, userLabel])

  const leave = useCallback(() => {
    setJoined(false)
    // Stop local tracks
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    // Destroy peers
    peersRef.current.forEach((p, id) => { try { p.destroy() } catch {} })
    peersRef.current.clear()
    setRemotePeers([])
    // Clean up socket listeners
    if (socketRef.current) {
      socketRef.current.off('peers')
      socketRef.current.off('user-joined')
      socketRef.current.off('user-left')
      socketRef.current.off('signal')
      socketRef.current.disconnect()
    }
    socketRef.current = null
    setRoomId('')
  }, [])

  const toggleMute = useCallback(() => {
    const next = !muted
    localStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = !next))
    setMuted(next)
  }, [muted])

  const toggleVideo = useCallback(() => {
    const next = !videoEnabled
    localStreamRef.current?.getVideoTracks().forEach(t => (t.enabled = !next))
    setVideoEnabled(next)
  }, [videoEnabled])

  const shareScreen = useCallback(async () => {
    if (sharing) {
      // revert to camera
      const cam = await navigator.mediaDevices.getUserMedia({ video: true })
      const camTrack = cam.getVideoTracks()[0]
      const senders = Array.from(peersRef.current.values()).flatMap(p => (p as any)._pc.getSenders?.() || [])
      senders.filter(s => s.track?.kind === 'video').forEach(s => s.replaceTrack(camTrack))
      // replace in local stream
      const ls = localStreamRef.current
      if (ls) {
        const old = ls.getVideoTracks()[0]
        if (old) ls.removeTrack(old)
        ls.addTrack(camTrack)
      }
      setSharing(false)
      return
    }
    try {
      // start share
      // @ts-ignore
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      const screenTrack = display.getVideoTracks()[0]
      const senders = Array.from(peersRef.current.values()).flatMap(p => (p as any)._pc.getSenders?.() || [])
      senders.filter(s => s.track?.kind === 'video').forEach(s => s.replaceTrack(screenTrack))
      // replace local
      const ls = localStreamRef.current
      if (ls) {
        const old = ls.getVideoTracks()[0]
        if (old) ls.removeTrack(old)
        ls.addTrack(screenTrack)
      }
      screenTrack.onended = () => {
        setSharing(false)
        // revert to camera automatically
        ;(async () => {
          const cam = await navigator.mediaDevices.getUserMedia({ video: true })
          const camTrack = cam.getVideoTracks()[0]
          const senders2 = Array.from(peersRef.current.values()).flatMap(p => (p as any)._pc.getSenders?.() || [])
          senders2.filter(s => s.track?.kind === 'video').forEach(s => s.replaceTrack(camTrack))
          const ls2 = localStreamRef.current
          if (ls2) {
            const old2 = ls2.getVideoTracks()[0]
            if (old2) ls2.removeTrack(old2)
            ls2.addTrack(camTrack)
          }
        })()
      }
      setSharing(true)
    } catch (e) {
      console.warn('shareScreen cancelled', e)
    }
  }, [sharing])

  return {
    joined,
    roomId,
    remotePeers,
    localStream: localStreamRef.current,
    join,
    rejoin,
    leave,
    toggleMute,
    toggleVideo,
    shareScreen,
    muted,
    videoEnabled,
    sharing,
    mediaError,
    mediaMode,
  }
}
