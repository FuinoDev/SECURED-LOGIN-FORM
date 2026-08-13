import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest, fetchCsrfToken, setCsrfToken } from '../lib/api'
import type { User } from '../types/auth'
import type {
  ChangePasswordInput,
  EmailOnlyInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validators/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiRequest<{ user: User }>('/api/auth/me', { csrf: false })
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        await fetchCsrfToken()
        await refreshUser()
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [refreshUser])

  const login = useCallback(async (input: LoginInput) => {
    const data = await apiRequest<{ user: User; csrfToken: string }>('/api/auth/login', {
      method: 'POST',
      body: input,
    })
    setCsrfToken(data.csrfToken)
    setUser(data.user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const { confirmPassword, ...payload } = input
    void confirmPassword
    return apiRequest<{ message: string }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
  }, [])

  const logout = useCallback(async () => {
    await apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setCsrfToken(null)
    await fetchCsrfToken()
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    return apiRequest<{ message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  }, [])

  const resendVerification = useCallback(async (input: EmailOnlyInput) => {
    return apiRequest<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: input,
    })
  }, [])

  const forgotPassword = useCallback(async (input: EmailOnlyInput) => {
    return apiRequest<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: input,
    })
  }, [])

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    const { confirmPassword, ...payload } = input
    void confirmPassword
    return apiRequest<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: payload,
    })
  }, [])

  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    const { confirmPassword, ...payload } = input
    void confirmPassword
    return apiRequest<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: payload,
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
