import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import WelcomePage from '@/pages/WelcomePage'
import HomePage from '@/pages/HomePage'
import ChatPage from '@/pages/ChatPage'
import AppShell from '@/components/layout/AppShell'

function RequireKey({ children }) {
  const apiKey = useAppStore(s => s.apiKey)
  if (!apiKey) return <Navigate to="/welcome" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route
          path="/"
          element={
            <RequireKey>
              <AppShell />
            </RequireKey>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="chat/:id" element={<ChatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}