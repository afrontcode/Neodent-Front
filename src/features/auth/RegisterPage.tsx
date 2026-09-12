import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui'
import { RegisterForm } from './components/RegisterForm'
import { useAuth } from './hooks'
import type { RegisterInput } from './types'

/** La raíz reparte a cada rol su pantalla de inicio. */
const HOME = '/'

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to={HOME} replace />

  const handleSubmit = async (input: RegisterInput) => {
    await register(input)
    navigate('/verificar-correo', { replace: true, state: { correo: input.correo } })
  }

  return (
    <Card className="px-8 py-9 max-sm:px-5">
      <header className="mb-7 text-center">
        <h2 className="text-[1.5rem] font-bold text-ink">Registro</h2>
        <p className="mt-1 text-[0.92rem] text-muted">Regístrate para poder programar citas</p>
      </header>

      <RegisterForm onSubmit={handleSubmit} />

      <div className="my-6 flex items-center gap-3 text-[0.85rem] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        O
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="text-center text-[0.92rem] text-ink-soft">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-bold text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  )
}
