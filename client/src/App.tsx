import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { AdminPage } from './pages/AdminPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResendVerificationPage } from './pages/ResendVerificationPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import './App.css'

function HomeRedirect() {
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
