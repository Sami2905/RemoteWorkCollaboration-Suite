import { DocEditorTipTap } from '../components/DocEditorTipTap'
import { useAuth } from '../features/auth/AuthProvider'

export default function Documents() {
  const { user } = useAuth()
  return (
    <div className="h-full p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Documents</h2>
        <div className="text-sm text-slate-500">Live collaboration via Yjs</div>
      </div>
      <DocEditorTipTap docId="doc-1" user={{ name: user?.email ?? 'Anonymous', color: '#6366f1' }} />
    </div>
  )
}


