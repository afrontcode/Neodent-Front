import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeFor } from '@/config/navigation'
import type { Role } from '@/features/users/types'
import { useAuth } from './hooks'

interface RequireAuthProps {
  /**
   * Roles con acceso a las rutas hijas. Si se omite, basta con tener sesión.
   * A quien no le corresponde se le devuelve a la pantalla de inicio de su rol,
   * para que nunca quede en una pantalla que no puede ver.
   */
  roles?: readonly Role[]
}

/** Bloquea las rutas hijas si no hay sesión y recuerda a dónde quería ir el usuario. */
export function RequireAuth({ roles }: RequireAuthProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.rol)) return <Navigate to={homeFor(user.rol)} replace />
  return <Outlet />
}
