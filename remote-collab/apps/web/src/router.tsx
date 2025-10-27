import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './ui/AppLayout'
import { RequireAuth } from './features/auth/RequireAuth'
import { lazy, Suspense } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'

const Chat = lazy(() => import('./pages/Chat'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Whiteboard = lazy(() => import('./pages/Whiteboard'))
const Documents = lazy(() => import('./pages/Documents'))
const Video = lazy(() => import('./pages/Video'))

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { index: true, element: <Home /> },
      { path: 'documents', element: <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}><Documents /></Suspense> },
      { path: 'whiteboard', element: <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}><Whiteboard /></Suspense> },
      { path: 'tasks', element: <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}><Tasks /></Suspense> },
      { path: 'chat', element: <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}><Chat /></Suspense> },
      { path: 'video', element: <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}><Video /></Suspense> },
    ],
  },
])


