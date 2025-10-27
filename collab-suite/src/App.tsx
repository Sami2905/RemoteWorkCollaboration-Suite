import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VideoConference from './pages/VideoConference'
import DocumentCollaboration from './pages/DocumentCollaboration'
import TaskManagement from './pages/TaskManagement'
import UserProfile from './pages/UserProfile'
import './App.css'

function App() {
  return (
    <Box minH="100vh">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/video-conference" element={<VideoConference />} />
          <Route path="/documents" element={<DocumentCollaboration />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App
