import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Checkbox, Field, Icon, Input } from '@/components/ui'
import { EMAIL_RE } from '@/lib/validation'
import type { Credentials } from '../types'

interface Errors {
  correo?: string
  password?: string
}

function validate(values: Credentials): Errors {
  const errors: Errors = {}
  if (!values.correo.trim()) errors.correo = 'Ingresa tu correo electrónico.'
  else if (!EMAIL_RE.test(values.correo.trim())) errors.correo = 'El correo no tiene un formato válido.'
  if (!values.password) errors.password = 'Ingresa tu contraseña.'
  return errors
}

interface LoginFormProps {
  /** Debe rechazar con un `Error` legible cuando las credenciales no sean válidas. */
  onSubmit: (credentials: Credentials) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [values, setValues] = useState<Credentials>({ correo: '', password: '', recordarme: true })
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof Credentials>(key: K, value: Credentials[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-[0.88rem] text-danger"
        >
          <Icon name="warning" size={18} />
          {serverError}
        </div>
      )}

      <Field label="Correo electrónico" error={errors.correo}>
        <Input
          type="email"
          name="correo"
          icon="user"
          placeholder="Ingresa tu correo"
          autoComplete="email"
          value={values.correo}
          onChange={(e) => update('correo', e.target.value)}
        />
      </Field>

      <Field label="Contraseña" error={errors.password}>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          icon="lock"
          placeholder="••••••••••••"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          trailing={
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((s) => !s)}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Icon name={showPassword ? 'eye' : 'eyeOff'} size={20} />
            </button>
          }
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Checkbox
          label="Recuérdame"
          name="recordarme"
          checked={values.recordarme}
          onChange={(e) => update('recordarme', e.target.checked)}
        />
        <Link to="/recuperar" className="text-[0.88rem] font-bold text-brand hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" disabled={submitting} className="w-full justify-center disabled:opacity-60">
        {submitting ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
