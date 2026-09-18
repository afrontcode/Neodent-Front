import { createContext } from 'react'
import type { User } from '@/features/users/types'
import type { Credentials, LoginOutcome, PendingVerification, RegisterInput } from './types'

/** Contrato de la sesión: quién está autenticado y cómo entrar, registrarse o salir. */
export interface AuthStore {
  /** Usuario autenticado, o `null` si no hay sesión. */
  user: User | null
  /** Verificación de correo en curso, o `null` si no hay ninguna. */
  pending: PendingVerification | null
  /**
   * Resuelve con `'ok'` si la sesión quedó abierta, o con `'verificar'` si la
   * cuenta todavía no confirmó su correo. Rechaza con un mensaje legible si
   * las credenciales no son válidas.
   */
  login: (credentials: Credentials) => Promise<LoginOutcome>
  /** Resuelve si el correo está disponible; rechaza con un mensaje legible si no. */
  register: (input: RegisterInput) => Promise<void>
  /**
   * Comprueba el código enviado al correo pendiente. Si la verificación venía
   * del inicio de sesión, además abre la sesión. Rechaza si el código no es válido.
   */
  verify: (code: string) => Promise<void>
  /** Vuelve a enviar el código al correo pendiente. */
  resend: () => Promise<void>
  /** Abandona la verificación en curso (por ejemplo, para usar otro correo). */
  cancelVerification: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthStore | null>(null)
