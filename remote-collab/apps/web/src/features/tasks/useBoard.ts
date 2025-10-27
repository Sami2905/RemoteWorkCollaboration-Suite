import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../features/auth/AuthProvider'

export function useBoard(workspaceId: string) {
  const { accessToken } = useAuth()
  return useQuery({
    queryKey: ['board', workspaceId],
    queryFn: async () => {
      const base = import.meta.env.VITE_API_URL_HTTP ?? 'http://localhost:8081'
      const res = await fetch(`${base}/workspaces/${workspaceId}/board`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      })
      if (!res.ok) throw new Error('Failed to load board')
      return res.json() as Promise<{
        id: string
        name: string
        columns: { id: string; title: string; order: number; tasks: { id: string; title: string; order: number }[] }[]
      }>
    },
    enabled: Boolean(workspaceId && accessToken),
  })
}
