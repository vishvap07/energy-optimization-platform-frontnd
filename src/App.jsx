import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Layouts & Components
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import ChatbotWidget from './components/ChatbotWidget'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AnalyticsPage from './pages/AnalyticsPage'
import ForecastPage from './pages/ForecastPage'
import OptimizationPage from './pages/OptimizationPage'
import TicketsPage from './pages/TicketsPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import MonitoringPage from './pages/MonitoringPage'
import ProfilePage from './pages/ProfilePage'

// Services
import authService from './services/authService'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile()
          setUser(profile)
        } catch (error) {
          authService.logout()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Unauthenticated routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Authenticated layout wrapper
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar userRole={user.role} />
      
      <div className="flex-1 flex flex-col w-full">
        <Navbar user={user} setUser={setUser} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 z-0">
          <div className="mx-auto max-w-7xl">
            <ErrorBoundary>
              <Routes>
                {/* Common Routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<UserDashboard user={user} />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/forecast" element={<ForecastPage />} />
                <Route path="/optimization" element={<OptimizationPage />} />
                
                {/* Ticket Routes */}
                <Route path="/tickets" element={<TicketsPage user={user} />} />
                <Route path="/tickets/create" element={<CreateTicketPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage currentUser={user} />} />
                <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />

                {/* Admin Only Routes */}
                {user.role === 'admin' || user.role === 'technician' ? (
                  <>
                    {user.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
                    <Route path="/monitoring" element={<MonitoringPage />} />
                  </>
                ) : (
                  <>
                    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/monitoring" element={<Navigate to="/dashboard" replace />} />
                  </>
                )}
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Floating Chatbot Widget for all authenticated users */}
      <ChatbotWidget />
    </div>
  )
}

export default App
