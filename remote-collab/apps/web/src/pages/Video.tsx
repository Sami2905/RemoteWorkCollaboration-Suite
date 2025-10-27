import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../features/auth/AuthProvider'
import { useMeshRoom } from '../features/video/useMeshRoom'

function VideoTile({ stream, label }: { stream: MediaStream | null | undefined; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
      ref.current.play().catch(() => {})
    }
  }, [stream])
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">
      <video ref={ref} className="block w-full h-60 object-cover bg-black" muted={label === 'You'} playsInline />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{label}</div>
    </div>
  )
}

export default function VideoPage() {
  const { user } = useAuth()
  const [room, setRoom] = useState('daily-standup')
  const {
    joined, localStream, remotePeers,
    join, rejoin, leave, toggleMute, toggleVideo, shareScreen,
    muted, videoEnabled, sharing, mediaError
  } = useMeshRoom(user?.email ?? 'Anonymous')

  return (
    <div className="h-full p-6 space-y-6">
      {!joined ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Video Conferencing</h2>
            <p className="text-slate-600 mb-4">Enter a room and start a multi‑peer call.</p>
            <div className="flex gap-3">
              <input className="flex-1 rounded-xl border px-3 py-2" value={room} onChange={e=>setRoom(e.target.value)} />
              <button onClick={()=>join(room)} className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-medium hover:bg-emerald-700">
                Join
              </button>
            </div>
            {mediaError && <div className="text-rose-600 text-sm mt-3">{mediaError}</div>}
            <p className="text-xs text-slate-500 mt-3">Signaling: {import.meta.env.VITE_SIGNALING_URL}</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <VideoTile stream={localStream} label="You" />
            {remotePeers.map(p => (
              <VideoTile key={p.id} stream={p.stream} label={p.id.slice(0,6)} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={toggleMute} className={`h-12 w-12 rounded-full shadow ${muted ? 'bg-rose-600 text-white' : 'bg-white border'}`}>
              {muted ? '🔇' : '🎤'}
            </button>
            <button onClick={toggleVideo} className={`h-12 w-12 rounded-full shadow ${!videoEnabled ? 'bg-rose-600 text-white' : 'bg-white border'}`}>
              {videoEnabled ? '📹' : '📴'}
            </button>
            <button onClick={shareScreen} className={`h-12 w-12 rounded-full shadow ${sharing ? 'bg-amber-600 text-white' : 'bg-white border'}`}>
              🖥️
            </button>
            <button onClick={rejoin} className="rounded-xl bg-indigo-600 text-white px-4 py-2 shadow">Rejoin</button>
            <button onClick={leave} className="h-12 w-12 rounded-full bg-rose-600 text-white shadow">📞</button>
          </div>
          <div className="text-center text-sm text-slate-600">
            Room: <span className="font-mono">{room}</span> • Peers: {remotePeers.length + 1}
          </div>
        </div>
      )}
    </div>
  )
}


