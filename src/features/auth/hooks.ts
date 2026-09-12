import { useContext } from 'react'
import { AuthContext, type AuthStore } from './context'

/** Acceso a la sesión. Falla pronto si falta el proveedor. */
export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
