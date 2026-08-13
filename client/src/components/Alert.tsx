import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import './Alert.css'

type AlertVariant = 'error' | 'success' | 'info'

type AlertProps = {
  variant?: AlertVariant
  children: ReactNode
}

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

export function Alert({ variant = 'info', children }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div className={`alert alert-${variant}`} role="alert">
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
