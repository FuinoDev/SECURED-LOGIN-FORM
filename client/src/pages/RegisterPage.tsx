import { useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../context/useAuth'
import { getErrorMessage, getFieldErrors } from '../lib/errors'
import { registerSchema } from '../validators/auth'

export function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword })
    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      return
    }

    setLoading(true)
    try {
      const result = await register(parsed.data)
      setSuccess(result.message)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create account.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register with a strong password to get started."
      footer={
        <>
          <span>Already have an account? </span>
          <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <FormField
          label="Full name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          required
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 12 characters. Avoid common passwords."
          required
        />

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
        />

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
