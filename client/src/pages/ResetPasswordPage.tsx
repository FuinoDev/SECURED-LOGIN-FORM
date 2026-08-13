import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../context/useAuth'
import { getErrorMessage, getFieldErrors } from '../lib/errors'
import { resetPasswordSchema } from '../validators/auth'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword })
    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword(parsed.data)
      setSuccess(result.message)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to reset password.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset password" subtitle="This reset link is invalid.">
        <Alert variant="error">Reset token is missing. Request a new link from the forgot password page.</Alert>
        <p className="auth-subtitle">
          <AuthLink to="/forgot-password">Request a new reset link</AuthLink>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new strong password for your account."
      footer={
        <>
          <span>Back to </span>
          <AuthLink to="/login">sign in</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 12 characters. Avoid common passwords."
          required
        />

        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
        />

        <Button type="submit" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  )
}
