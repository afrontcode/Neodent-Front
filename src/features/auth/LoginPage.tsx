import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { LoginForm } from './components/LoginForm'
import { useAuth } from './hooks'
import type { Credentials } from './types'

/** La raíz reparte a cada rol su pantalla de inicio. */
const HOME = '/'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from: string = location.state?.from?.pathname ?? HOME

  if (user) return <Navigate to={from} replace />

  const handleSubmit = async (credentials: Credentials) => {
    await login(credentials)
    navigate(from, { replace: true })
  }

  return (
    <Card className="px-8 py-9 max-sm:px-5">
      <header className="mb-7 text-center">
        <h2 className="text-[1.5rem] font-bold text-ink">Inicia sesión</h2>
        <p className="mt-1 text-[0.92rem] text-muted">Ingresa tus credenciales para acceder</p>
      </header>

      <LoginForm onSubmit={handleSubmit} />

      <div className="my-6 flex items-center gap-3 text-[0.85rem] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        O
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="text-center text-[0.92rem] text-ink-soft">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-bold text-brand hover:underline">
          Regístrate
        </Link>
      </p>
    </Card>
  )
}
