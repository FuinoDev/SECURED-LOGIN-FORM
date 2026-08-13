import { createContext } from 'react'
import type { User } from '../types/auth'
import type {
  ChangePasswordInput,
  EmailOnlyInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validators/auth'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<{ message: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  verifyEmail: (token: string) => Promise<{ message: string }>
  resendVerification: (input: EmailOnlyInput) => Promise<{ message: string }>
  forgotPassword: (input: EmailOnlyInput) => Promise<{ message: string }>
  resetPassword: (input: ResetPasswordInput) => Promise<{ message: string }>
  changePassword: (input: ChangePasswordInput) => Promise<{ message: string }>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
