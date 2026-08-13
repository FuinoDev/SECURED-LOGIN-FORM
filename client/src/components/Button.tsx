import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  children: ReactNode
}

export function Button({ loading, disabled, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`btn ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      <span>{loading ? 'Please wait…' : children}</span>
    </button>
  )
}
