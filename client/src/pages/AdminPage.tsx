import { useCallback, useEffect, useState } from 'react'
import { Shield, Users } from 'lucide-react'
import { Alert } from '../components/Alert'
import { AuthLayout, AuthLink } from '../components/AuthLayout'
import { Button } from '../components/Button'
import {
  fetchAuditLogs,
  fetchUsers,
  updateUserAccount,
  type AuditLogEntry,
} from '../lib/admin'
import { getErrorMessage } from '../lib/errors'
import type { User } from '../types/auth'
import './AdminPage.css'

type Tab = 'users' | 'logs'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionUserId, setActionUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    const data = await fetchUsers()
    setUsers(data.items)
  }, [])

  const loadLogs = useCallback(async () => {
    const data = await fetchAuditLogs()
    setLogs(data.items)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (tab === 'users') {
          await loadUsers()
        } else {
          await loadLogs()
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load admin data.'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [tab, loadUsers, loadLogs])

  async function handleToggleActive(user: User) {
    setActionUserId(user.id)
    setError(null)
    try {
      await updateUserAccount(user.id, { isActive: !user.isActive })
      await loadUsers()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to update user.'))
    } finally {
      setActionUserId(null)
    }
  }

  return (
    <AuthLayout title="Admin" subtitle="Manage users and review security activity.">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === 'users' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('users')}
        >
          <Users size={16} aria-hidden="true" />
          Users
        </button>
        <button
          type="button"
          className={tab === 'logs' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('logs')}
        >
          <Shield size={16} aria-hidden="true" />
          Security logs
        </button>
      </div>

      {loading ? <p className="admin-loading">Loading…</p> : null}

      {!loading && tab === 'users' ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                  <td>{user.isActive ? 'Active' : 'Disabled'}</td>
                  <td>
                    <Button
                      type="button"
                      className="btn-secondary btn-small"
                      loading={actionUserId === user.id}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'logs' ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>User</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.user?.email ?? '—'}</td>
                  <td>{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="admin-footer">
        <AuthLink to="/dashboard">Back to dashboard</AuthLink>
      </div>
    </AuthLayout>
  )
}
