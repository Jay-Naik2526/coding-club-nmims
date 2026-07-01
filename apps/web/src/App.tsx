import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Cursor } from '@/components/Cursor'
import { Preloader } from '@/components/Preloader'
import { WipeProvider } from '@/components/Wipe'
import { NewsLayout } from '@/layouts/NewsLayout'
import { RouteFallback } from '@/components/RouteFallback'

import { useEffect } from 'react'
import { useApp } from '@/store/useApp'

// Code-split: three.js (landing) and heavy pages load on demand.
const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/Signup').then((m) => ({ default: m.SignupPage })))
const EventsPage = lazy(() => import('@/pages/Events').then((m) => ({ default: m.EventsPage })))
const EventDetailPage = lazy(() => import('@/pages/EventDetail').then((m) => ({ default: m.EventDetailPage })))
const TeamPage = lazy(() => import('@/pages/Team').then((m) => ({ default: m.TeamPage })))
const JoinPage = lazy(() => import('@/pages/Join').then((m) => ({ default: m.JoinPage })))
const LeaderboardPage = lazy(() => import('@/pages/Leaderboard').then((m) => ({ default: m.LeaderboardPage })))
const IdePage = lazy(() => import('@/pages/Ide').then((m) => ({ default: m.IdePage })))
const ProfilePage = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.ProfilePage })))
const TicketPage = lazy(() => import('@/pages/Ticket').then((m) => ({ default: m.TicketPage })))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

// Guard: only ADMIN role can access /admin. Defined outside App() so it's a
// stable component reference across renders (not recreated every render).
function AdminGuard() {
  const user = useApp((s) => s.user)
  const loading = useApp((s) => s.loading)
  if (loading) return <RouteFallback />
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" replace />
  return <AdminDashboardPage />
}

export function App() {
  const fetchUser = useApp((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <div className="scanlines">
      <Preloader />
      <Cursor />
      <WipeProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Newspaper world */}
            <Route element={<NewsLayout />}>
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/ide" element={<IdePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ticket/:id" element={<TicketPage />} />
              <Route path="/admin" element={<AdminGuard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </WipeProvider>
    </div>
  )
}
