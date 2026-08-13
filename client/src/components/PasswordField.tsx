import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './FormField.css'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
  hint?: string
}

export function PasswordField({ label, error, hint, id, className = '', ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const fieldId = id ?? props.name

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={fieldId}>{label}</label>
      <div className="password-wrap">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className={`form-input ${className}`}
          aria-invalid={Boolean(error)}
          autoComplete={props.autoComplete ?? 'current-password'}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && !error ? <span className="field-hint">{hint}</span> : null}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
