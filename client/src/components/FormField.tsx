import type { InputHTMLAttributes } from 'react'
import './FormField.css'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function FormField({ label, error, id, className = '', ...props }: FormFieldProps) {
  const fieldId = id ?? props.name

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={fieldId}>{label}</label>
      <input id={fieldId} className={`form-input ${className}`} aria-invalid={Boolean(error)} {...props} />
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
