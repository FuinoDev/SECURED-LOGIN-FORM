import { useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { useAuth } from '../context/useAuth'
import { getErrorMessage, getFieldErrors } from '../lib/errors'
import { emailOnlySchema } from '../validators/auth'

export function ResendVerificationPage() {
  const { resendVerification } = useAuth()
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const parsed = emailOnlySchema.safeParse({ email })
    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      return
    }

    setLoading(true)
    try {
      const result = await resendVerification(parsed.data)
      setSuccess(result.message)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to send verification email.'))
      setFieldErrors(getFieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Resend verification"
      subtitle="Enter your email to receive a new verification link."
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

        <Button type="submit" loading={loading}>
          Resend verification email
        </Button>
      </form>
    </AuthLayout>
  )
}
