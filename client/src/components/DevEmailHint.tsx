import { Alert } from './Alert'

export function DevEmailHint() {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <Alert variant="info">
      Development mode: email links are printed in the API server terminal (the window running{' '}
      <strong>npm run dev:server</strong>), not sent to your inbox. Look for{' '}
      <strong>[email:dev]</strong> and copy the verify-email URL.
    </Alert>
  )
}
