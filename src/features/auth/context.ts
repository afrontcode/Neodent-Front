import { createContext } from 'react'
import type { User } from '@/features/users/types'
import type { Credentials, RegisterInput } from './types'

/** Contrato de la sesión: quién está autenticado y cómo entrar, registrarse o salir. */
export interface AuthStore {
  /** Usuario autenticado, o `null` si no hay sesión. */
  user: User | null
  /** Resuelve al iniciar sesión; rechaza con un mensaje legible si falla. */
  login: (credentials: Credentials) => Promise<void>
  /** Resuelve si el correo está disponible; rechaza con un mensaje legible si no. */
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthStore | null>(null)
