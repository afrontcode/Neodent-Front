import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/features/users/types'
import { useAuth } from './hooks'

interface RequireAuthProps {
  roles?: readonly Role[]
}

export function RequireAuth({ roles }: RequireAuthProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-ink-soft">
        Cargando sesión…
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    )
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}