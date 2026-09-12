import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Checkbox, Field, Icon, Input, Select } from '@/components/ui'
import { EMAIL_RE, MIN_PASSWORD } from '@/lib/validation'
import { DOCUMENT_TYPES, type DocumentType, type RegisterInput } from '../types'

type Errors = Partial<Record<keyof RegisterInput, string>>

const PHONE_RE = /^\d{9}$/

function validate(values: RegisterInput): Errors {
  const errors: Errors = {}

  if (!values.numeroDocumento.trim()) errors.numeroDocumento = 'Ingresa tu número de documento.'
  else if (values.tipoDocumento === 'DNI' && !/^\d{8}$/.test(values.numeroDocumento.trim())) {
    errors.numeroDocumento = 'El DNI debe tener 8 dígitos.'
  }

  if (!values.nombres.trim()) errors.nombres = 'Ingresa tus nombres.'
  if (!values.apellidoPaterno.trim()) errors.apellidoPaterno = 'Ingresa tu apellido paterno.'
  if (!values.apellidoMaterno.trim()) errors.apellidoMaterno = 'Ingresa tu apellido materno.'

  if (!values.fechaNacimiento) errors.fechaNacimiento = 'Ingresa tu fecha de nacimiento.'
  else if (values.fechaNacimiento > new Date().toISOString().slice(0, 10)) {
    errors.fechaNacimiento = 'La fecha no puede ser futura.'
  }

  if (!values.telefono.trim()) errors.telefono = 'Ingresa tu teléfono.'
  else if (!PHONE_RE.test(values.telefono.trim())) errors.telefono = 'Ingresa un teléfono válido de 9 dígitos.'

  if (!values.correo.trim()) errors.correo = 'Ingresa tu correo electrónico.'
  else if (!EMAIL_RE.test(values.correo.trim())) errors.correo = 'El correo no tiene un formato válido.'

  if (!values.password) errors.password = 'Ingresa una contraseña.'
  else if (values.password.length < MIN_PASSWORD) errors.password = `Debe tener al menos ${MIN_PASSWORD} caracteres.`

  if (!values.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Las contraseñas no coinciden.'

  if (!values.aceptaTerminos) errors.aceptaTerminos = 'Debes aceptar los términos y condiciones.'

  return errors
}

const INITIAL_VALUES: RegisterInput = {
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  telefono: '',
  correo: '',
  password: '',
  confirmPassword: '',
  aceptaTerminos: false,
}

interface RegisterFormProps {
  /** Debe rechazar con un `Error` legible cuando el registro no sea válido. */
  onSubmit: (input: RegisterInput) => Promise<void>
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterInput>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) => {
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
      setServerError(err instanceof Error ? err.message : 'No se pudo completar el registro.')
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

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Tipo de Documento">
          <Select
            options={DOCUMENT_TYPES}
            value={values.tipoDocumento}
            onChange={(e) => update('tipoDocumento', e.target.value as DocumentType)}
          />
        </Field>
        <Field label="Número de Documento" error={errors.numeroDocumento}>
          <Input
            placeholder="Ej. 87654321"
            inputMode="numeric"
            value={values.numeroDocumento}
            onChange={(e) => update('numeroDocumento', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Nombres" error={errors.nombres}>
        <Input
          icon="user"
          placeholder="Ej. María"
          autoComplete="given-name"
          value={values.nombres}
          onChange={(e) => update('nombres', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Apellido Paterno" error={errors.apellidoPaterno}>
          <Input
            icon="user"
            placeholder="Ej. Rojas"
            autoComplete="family-name"
            value={values.apellidoPaterno}
            onChange={(e) => update('apellidoPaterno', e.target.value)}
          />
        </Field>
        <Field label="Apellido Materno" error={errors.apellidoMaterno}>
          <Input
            icon="user"
            placeholder="Ej. Perez"
            value={values.apellidoMaterno}
            onChange={(e) => update('apellidoMaterno', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Fecha de Nacimiento" error={errors.fechaNacimiento}>
          <Input
            icon="user"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={values.fechaNacimiento}
            onChange={(e) => update('fechaNacimiento', e.target.value)}
          />
        </Field>
        <Field label="Teléfono" error={errors.telefono}>
          <Input
            icon="user"
            placeholder="Ej. 987654321"
            inputMode="numeric"
            autoComplete="tel"
            value={values.telefono}
            onChange={(e) => update('telefono', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Correo electrónico" error={errors.correo}>
        <Input
          type="email"
          icon="mail"
          placeholder="Ingresa tu correo"
          autoComplete="email"
          value={values.correo}
          onChange={(e) => update('correo', e.target.value)}
        />
      </Field>

      <Field label="Contraseña" error={errors.password}>
        <Input
          type={showPassword ? 'text' : 'password'}
          icon="lock"
          placeholder="••••••••••••"
          autoComplete="new-password"
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

      <Field label="Confirmar contraseña" error={errors.confirmPassword}>
        <Input
          type={showConfirm ? 'text' : 'password'}
          icon="lock"
          placeholder="••••••••••••"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          trailing={
            <button
              type="button"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showConfirm}
              onClick={() => setShowConfirm((s) => !s)}
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Icon name={showConfirm ? 'eye' : 'eyeOff'} size={20} />
            </button>
          }
        />
      </Field>

      <div>
        <Checkbox
          label={
            <>
              Estoy de acuerdo con los{' '}
              <Link to="/terminos" className="font-bold text-brand hover:underline">
                Términos y condiciones
              </Link>
            </>
          }
          checked={values.aceptaTerminos}
          onChange={(e) => update('aceptaTerminos', e.target.checked)}
        />
        {errors.aceptaTerminos && <p className="mt-1.5 text-[0.82rem] text-danger">{errors.aceptaTerminos}</p>}
      </div>

      <Button type="submit" disabled={submitting} className="w-full justify-center disabled:opacity-60">
        {submitting ? 'Registrando…' : 'Registrar'}
      </Button>
    </form>
  )
}
