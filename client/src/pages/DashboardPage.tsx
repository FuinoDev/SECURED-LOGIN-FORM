import { useNavigate } from 'react-router-dom'
import { BadgeCheck, KeyRound, Mail, Shield } from 'lucide-react'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { useAuth } from '../context/useAuth'
import { useState } from 'react'
import { getErrorMessage } from '../lib/errors'
import './DashboardPage.css'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return null
  }

  async function handleLogout() {
    setError(null)
    setLoading(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign out.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Dashboard" subtitle="You are signed in securely.">
      {error ? <Alert variant="error">{error}</Alert> : null}

      {!user.emailVerified ? (
        <Alert variant="info">
          Your email is not verified yet.{' '}
          <AuthLink to="/resend-verification">Resend verification email</AuthLink>
        </Alert>
      ) : null}

      <div className="dashboard-grid">
        <div className="dashboard-item">
          <Mail size={18} aria-hidden="true" />
          <div>
            <span className="dashboard-label">Email</span>
            <span className="dashboard-value">{user.email}</span>
          </div>
        </div>

        <div className="dashboard-item">
          <Shield size={18} aria-hidden="true" />
          <div>
            <span className="dashboard-label">Role</span>
            <span className="dashboard-value">{user.role}</span>
          </div>
        </div>

        <div className="dashboard-item">
          <BadgeCheck size={18} aria-hidden="true" />
          <div>
            <span className="dashboard-label">Email verified</span>
            <span className="dashboard-value">{user.emailVerified ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div className="dashboard-item">
          <KeyRound size={18} aria-hidden="true" />
          <div>
            <span className="dashboard-label">Member since</span>
            <span className="dashboard-value">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <AuthLink to="/change-password">Change password</AuthLink>
        <Button type="button" className="btn-secondary" loading={loading} onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </AuthLayout>
  )
}
