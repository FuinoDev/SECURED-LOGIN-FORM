import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { LoadingScreen } from './LoadingScreen'

export function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
