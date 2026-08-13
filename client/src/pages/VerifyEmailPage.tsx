import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from '../context/useAuth'
import { getErrorMessage } from '../lib/errors'

export function VerifyEmailPage() {
  const { verifyEmail, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(
    token ? null : 'Verification link is missing or invalid.',
  )
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const result = await verifyEmail(token)
        if (!cancelled) {
          setMessage(result.message)
          await refreshUser()
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Unable to verify email.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token, verifyEmail, refreshUser])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your email address.">
      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <p className="auth-subtitle">
        <Link to="/login" className="auth-link">
          Continue to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
