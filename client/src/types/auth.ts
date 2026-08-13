export type Role = 'USER' | 'ADMIN'

export type User = {
  id: string
  email: string
  name: string | null
  role: Role
  emailVerified: boolean
  isActive: boolean
  createdAt: string
}

export type ApiErrorBody = {
  error: string
  code?: string
  details?: Array<{ path: string; message: string }>
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: ApiErrorBody['details']

  constructor(status: number, body: ApiErrorBody) {
    super(body.error)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}
