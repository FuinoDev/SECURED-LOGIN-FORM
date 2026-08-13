import type { ZodError } from 'zod'
import { ApiError } from '../types/auth'

export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.details?.length) {
    return Object.fromEntries(error.details.map((d) => [d.path, d.message]))
  }

  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as ZodError
    return Object.fromEntries(zodError.issues.map((issue) => [issue.path.join('.'), issue.message]))
  }

  return {}
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
