import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import SwUpdateBanner from './components/SwUpdateBanner'
import InstallButton from './components/InstallButton'
import { CivicProvider, useCivicContext } from './context/CivicContext'
import useOnlineStatus from './hooks/useOnlineStatus'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const ReportIssue = lazy(() => import('./pages/ReportIssue'))
const Complaints = lazy(() => import('./pages/Complaints'))
const ComplaintDetails = lazy(() => import('./pages/ComplaintDetails'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))

function ProtectedRoute({ children }) {
  const { user } = useCivicContext()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppShell() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const { theme, user } = useCivicContext()

  useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'dark')
  }, [theme])

  // Show navbar only for authenticated routes
  const shouldShowNavbar = user

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {!isOnline && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
          {t('offline.banner')}
        </div>
      )}

      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? 'pb-10' : ''}>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {t('common.loading')}
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>

      <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
        <InstallButton variant="float" />
      </div>

      <SwUpdateBanner />
    </div>
  )
}

export default function App() {
  return (
    <CivicProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </BrowserRouter>
    </CivicProvider>
  )
}
