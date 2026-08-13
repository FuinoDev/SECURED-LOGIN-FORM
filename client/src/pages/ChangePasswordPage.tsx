import { useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../context/useAuth'
import { getErrorMessage, getFieldErrors } from '../lib/errors'
import { changePasswordSchema } from '../validators/auth'

export function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
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

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    })

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      return
    }

    setLoading(true)
    try {
      const result = await changePassword(parsed.data)
      setSuccess(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to change password.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Change password"
      subtitle="Update your password. Other active sessions will be signed out."
      footer={
        <>
          <span>Back to </span>
          <AuthLink to="/dashboard">dashboard</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <PasswordField
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={fieldErrors.currentPassword}
          required
        />

        <PasswordField
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={fieldErrors.newPassword}
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
          Update password
        </Button>
      </form>
    </AuthLayout>
  )
}
