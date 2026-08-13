import { apiRequest } from './api'
import type { User } from '../types/auth'

export type Paginated<T> = {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AuditLogEntry = {
  id: string
  userId: string | null
  action: string
  ipAddress: string | null
  userAgent: string | null
  metadata: unknown
  createdAt: string
  user: { email: string; name: string | null } | null
}

export async function fetchUsers(page = 1, limit = 20) {
  return apiRequest<Paginated<User>>(`/api/admin/users?page=${page}&limit=${limit}`, {
    csrf: false,
  })
}

export async function fetchAuditLogs(page = 1, limit = 20) {
  return apiRequest<Paginated<AuditLogEntry>>(
    `/api/admin/audit-logs?page=${page}&limit=${limit}`,
    { csrf: false },
  )
}

export async function updateUserAccount(
  userId: string,
  data: { isActive?: boolean; role?: 'USER' | 'ADMIN' },
) {
  return apiRequest<{ user: User }>(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: data,
  })
}
