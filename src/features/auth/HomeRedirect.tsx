import { Navigate } from 'react-router-dom'
import { homeFor } from '@/config/navigation'
import { useAuth } from './hooks'

/** Reparte la raíz de la aplicación a la pantalla de inicio de cada rol. */
export function HomeRedirect() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homeFor(user.rol)} replace />
}
