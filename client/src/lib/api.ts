import type { ApiErrorBody } from '../types/auth'
import { ApiError } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

let csrfToken: string | null = null

function getCsrfFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function getCsrfToken(): string | null {
  return csrfToken ?? getCsrfFromCookie()
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const data = text ? (JSON.parse(text) as T | ApiErrorBody) : ({} as T)

  if (!response.ok) {
    const body = data as ApiErrorBody
    throw new ApiError(response.status, {
      error: body.error ?? 'Request failed.',
      code: body.code,
      details: body.details,
    })
  }

  return data as T
}

type RequestOptions = {
  method?: string
  body?: unknown
  csrf?: boolean
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, csrf = method !== 'GET' && method !== 'HEAD' }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (csrf) {
    const token = getCsrfToken()
    if (!token) {
      await fetchCsrfToken()
    }
    const resolved = getCsrfToken()
    if (resolved) {
      headers['X-CSRF-Token'] = resolved
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response)
}

export async function fetchCsrfToken(): Promise<string> {
  const data = await apiRequest<{ csrfToken: string }>('/api/auth/csrf', { csrf: false })
  setCsrfToken(data.csrfToken)
  return data.csrfToken
}
