import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Alert, Button, Checkbox, Field, Icon, Input } from '@/components/ui'
import { authApi } from '@/api/authApi'
import { ApiError } from '@/api/apiClient'
import { EMAIL_RE, MIN_PASSWORD } from '@/lib/validation'
import type { RegisterInput } from '../types'
import { SecurityVerification } from './SecurityVerification'
import { FieldCheck } from './FieldCheck'

type Errors = Partial<Record<keyof RegisterInput, string>>
type DniStatus = 'idle' | 'waiting' | 'checking' | 'valid' | 'conflict' | 'error'

const DNI_RE = /^\d{8}$/
const PHONE_RE = /^\d{9}$/
const DNI_DELAY = 1500

const INITIAL_VALUES: RegisterInput = {
  tipoDocumento: 'DNI', numeroDocumento: '', nombres: '',
  apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '',
  telefono: '', correo: '', password: '', confirmPassword: '',
  aceptaTerminos: false,
}

function validate(v: RegisterInput): Errors {
  const e: Errors = {}

  if (!DNI_RE.test(v.numeroDocumento)) e.numeroDocumento = 'El DNI debe tener exactamente 8 dígitos.'
  if (!v.nombres.trim()) e.nombres = 'Ingresa tus nombres.'
  if (!v.apellidoPaterno.trim()) e.apellidoPaterno = 'Ingresa tu apellido paterno.'
  if (!v.apellidoMaterno.trim()) e.apellidoMaterno = 'Ingresa tu apellido materno.'

  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
  if (!v.fechaNacimiento) e.fechaNacimiento = 'Ingresa tu fecha de nacimiento.'
  else if (v.fechaNacimiento > hoy) e.fechaNacimiento = 'La fecha no puede ser futura.'

  if (!PHONE_RE.test(v.telefono)) e.telefono = 'Ingresa un teléfono de 9 dígitos.'
  if (!EMAIL_RE.test(v.correo.trim())) e.correo = 'Ingresa un correo válido.'
  if (v.password.length < MIN_PASSWORD) e.password = `Debe tener al menos ${MIN_PASSWORD} caracteres.`
  if (!v.confirmPassword || v.confirmPassword !== v.password)
    e.confirmPassword = 'Las contraseñas no coinciden.'
  if (!v.aceptaTerminos) e.aceptaTerminos = 'Debes aceptar los términos y condiciones.'

  return e
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={show}
      className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-soft transition-colors hover:text-ink">
      <Icon name={show ? 'eye' : 'eyeOff'} size={18} />
    </button>
  )
}

interface RegisterFormProps {
  onSubmit: (input: RegisterInput, turnstileToken: string) => Promise<void>
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterInput>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [securityToken, setSecurityToken] = useState<string | null>(null)
  const [securityKey, setSecurityKey] = useState(0)
  const [dniStatus, setDniStatus] = useState<DniStatus>('idle')
  const [dniValidado, setDniValidado] = useState<string | null>(null)
  const [dniError, setDniError] = useState<string | null>(null)
  const [datosAutocompletados, setDatosAutocompletados] = useState(false)

  const documentoActual = useRef('')
  const ultimoDniConsultado = useRef<string | null>(null)
  const consultaActual = useRef(0)

  const dniEstaValidado = dniStatus === 'valid' && dniValidado === values.numeroDocumento
  const puedeEditarDatos = dniEstaValidado && !datosAutocompletados && !submitting

  const update = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) => {
    setValues(v => ({ ...v, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
    setServerError(null)
  }

  const handleDocumentChange = (value: string) => {
    const dni = value.replace(/\D/g, '').slice(0, 9)
    if (dni === documentoActual.current) return

    documentoActual.current = dni
    consultaActual.current++
    ultimoDniConsultado.current = null

    setDniValidado(null)
    setDniError(null)
    setDatosAutocompletados(false)
    setDniStatus(DNI_RE.test(dni) ? 'waiting' : 'idle')
    setErrors(e => ({
      ...e,
      numeroDocumento: dni.length > 8 ? 'El DNI debe tener exactamente 8 dígitos.' : undefined,
    }))

    setValues(v => ({
      ...v, numeroDocumento: dni, nombres: '',
      apellidoPaterno: '', apellidoMaterno: '',
    }))
  }

  const handleCheckDni = useCallback(async (dni: string, token: string) => {
    const consultaId = ++consultaActual.current
    setDniStatus('checking')
    setDniError(null)
    setSecurityToken(null)

    try {
      const response = await authApi.checkPatientDni(dni, token)
      if (consultaActual.current !== consultaId || documentoActual.current !== dni) return

      setDniValidado(dni)
      setDniStatus('valid')
      setDatosAutocompletados(!response.manualEntryRequired)
      setValues(v => ({
        ...v,
        nombres: response.nombres ?? '',
        apellidoPaterno: response.apellidoPaterno ?? '',
        apellidoMaterno: response.apellidoMaterno ?? '',
      }))
    } catch (error) {
      if (consultaActual.current !== consultaId || documentoActual.current !== dni) return

      setDniValidado(null)
      setDatosAutocompletados(false)

      if (error instanceof ApiError && error.status === 409) {
        setDniStatus('conflict')
        setDniError('Este DNI ya está registrado.')
      } else {
        setDniStatus('error')
        setDniError(error instanceof Error ? error.message : 'No se pudo validar el DNI.')
      }
    } finally {
      // Cada solicitud consume un token: solicitamos otro para la siguiente operación.
      setSecurityKey(k => k + 1)
    }
  }, [])

  useEffect(() => {
    const dni = values.numeroDocumento
    if (!DNI_RE.test(dni) || !securityToken || submitting) return
    if (dniStatus !== 'waiting' || ultimoDniConsultado.current === dni) return

    const timer = window.setTimeout(() => {
      ultimoDniConsultado.current = dni
      void handleCheckDni(dni, securityToken)
    }, DNI_DELAY)

    return () => window.clearTimeout(timer)
  }, [values.numeroDocumento, securityToken, dniStatus, submitting, handleCheckDni])

  const handleRetryDni = () => {
    consultaActual.current++
    ultimoDniConsultado.current = null
    setDniError(null)
    setDniStatus('waiting')
    setSecurityToken(null)
    setSecurityKey(k => k + 1)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting || dniStatus === 'checking') return

    const found = validate(values)
    if (!dniEstaValidado) found.numeroDocumento = 'Primero debes validar tu DNI.'
    setErrors(found)
    if (Object.keys(found).length) return

    if (!securityToken) {
      setServerError('Espera a que termine la verificación de seguridad.')
      return
    }

    setSubmitting(true)
    setServerError(null)

    const token = securityToken
    setSecurityToken(null)

    try {
      await onSubmit(values, token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar el registro.'

      if (error instanceof ApiError && error.status === 409) {
        const campo = /teléfono|telefono/i.test(message) ? 'telefono'
          : /correo|email/i.test(message) ? 'correo'
          : /documento|DNI/i.test(message) ? 'numeroDocumento'
          : null

        if (campo) setErrors(current => ({ ...current, [campo]: message }))
        else setServerError(message)
      } else {
        setServerError(message)
      }

      setSecurityKey(current => current + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
  const valid = {
    nombres: dniEstaValidado && !!values.nombres.trim(),
    paterno: dniEstaValidado && !!values.apellidoPaterno.trim(),
    materno: dniEstaValidado && !!values.apellidoMaterno.trim(),
    fecha: !!values.fechaNacimiento && values.fechaNacimiento <= hoy,
    telefono: PHONE_RE.test(values.telefono),
    correo: EMAIL_RE.test(values.correo.trim()),
    password: values.password.length >= MIN_PASSWORD,
    confirmar: !!values.confirmPassword && values.confirmPassword === values.password,
  }

  const dniIndicator = (
    <AnimatePresence mode="wait">
      {(dniStatus === 'waiting' || dniStatus === 'checking') && (
        <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} role="status" aria-label="Validando documento"
          className="grid size-5 place-items-center">
          <span className="size-3.5 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        </motion.span>
      )}
      {dniStatus === 'valid' && (
        <motion.span key="valid" initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }} role="status" aria-label="DNI validado"
          className="grid size-5 place-items-center rounded-full bg-success text-white">
          <Icon name="check" size={12} />
        </motion.span>
      )}
      {(dniStatus === 'conflict' || dniStatus === 'error') && (
        <motion.span key="invalid" initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }} role="status" aria-label="Error de validación"
          className="grid size-5 place-items-center rounded-full bg-danger-soft text-danger">
          <Icon name="warning" size={12} />
        </motion.span>
      )}
    </AnimatePresence>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <Alert variant="error" shake onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      {/* Documento */}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Tipo de Documento">
          <Input value="DNI" disabled />
        </Field>

        <div className="min-w-0">
          <Field label="Número de Documento" error={errors.numeroDocumento}>
            <Input placeholder="Ej. 87654321" inputMode="numeric" maxLength={9}
              value={values.numeroDocumento} disabled={submitting}
              trailing={dniIndicator}
              onChange={e => handleDocumentChange(e.target.value)} />
          </Field>

          {/* Sin espacio reservado: solo aparece cuando hay una observación */}
          <AnimatePresence initial={false}>
            {dniStatus === 'conflict' && (
              <motion.p key="conflict" role="alert"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-1 text-[0.82rem] font-semibold leading-5 text-danger">
                {dniError}{' '}
                <Link to="/login" className="font-semibold text-brand hover:underline">Inicia sesión</Link>
              </motion.p>
            )}

            {dniStatus === 'error' && (
              <motion.p key="error" role="alert"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-1 text-[0.82rem] font-semibold leading-5 text-danger">
                {dniError}{' '}
                <button type="button" onClick={handleRetryDni}
                  className="font-semibold text-brand hover:underline">Reintentar</button>
              </motion.p>
            )}

            {dniStatus === 'valid' && !datosAutocompletados && (
              <motion.p key="manual"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden pt-1 text-[0.82rem] font-semibold leading-5 text-ink-soft">
                Completa tus datos manualmente.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nombres y apellidos */}
      <Field label="Nombres" error={errors.nombres}>
        <Input icon="user" placeholder="Ej. María" autoComplete="given-name"
          value={values.nombres} disabled={!puedeEditarDatos}
          trailing={<FieldCheck valid={valid.nombres} />}
          onChange={e => update('nombres', e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Apellido Paterno" error={errors.apellidoPaterno}>
          <Input icon="user" placeholder="Ej. Rojas" autoComplete="family-name"
            value={values.apellidoPaterno} disabled={!puedeEditarDatos}
            trailing={<FieldCheck valid={valid.paterno} />}
            onChange={e => update('apellidoPaterno', e.target.value)} />
        </Field>
        <Field label="Apellido Materno" error={errors.apellidoMaterno}>
          <Input icon="user" placeholder="Ej. Pérez" value={values.apellidoMaterno}
            disabled={!puedeEditarDatos} trailing={<FieldCheck valid={valid.materno} />}
            onChange={e => update('apellidoMaterno', e.target.value)} />
        </Field>
      </div>

      {/* Datos de contacto */}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <Field label="Fecha de Nacimiento" error={errors.fechaNacimiento}>
          <Input icon="user" type="date" max={hoy}
            value={values.fechaNacimiento} disabled={submitting}
            onChange={e => update('fechaNacimiento', e.target.value)} />
        </Field>

        <Field label="Teléfono" error={errors.telefono}>
          <Input icon="user" placeholder="Ej. 987654321" inputMode="numeric" maxLength={9}
            autoComplete="tel" value={values.telefono} disabled={submitting}
            trailing={<FieldCheck valid={valid.telefono} />}
            onChange={e => update('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))} />
        </Field>
      </div>

      <Field label="Correo electrónico" error={errors.correo}>
        <Input type="email" icon="mail" placeholder="Ingresa tu correo"
          autoComplete="email" value={values.correo} disabled={submitting}
          trailing={<FieldCheck valid={valid.correo} />}
          onChange={e => update('correo', e.target.value)} />
      </Field>

      {/* Contraseñas */}
      <Field label="Contraseña" error={errors.password}>
        <Input type={showPassword ? 'text' : 'password'} icon="lock"
          placeholder="••••••••••••" autoComplete="new-password"
          value={values.password} disabled={submitting}
          onChange={e => update('password', e.target.value)}
          trailing={<span className="flex items-center gap-1">
            <FieldCheck valid={valid.password} />
            <PasswordToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
          </span>} />
      </Field>

      <Field label="Confirmar contraseña" error={errors.confirmPassword}>
        <Input type={showConfirm ? 'text' : 'password'} icon="lock"
          placeholder="••••••••••••" autoComplete="new-password"
          value={values.confirmPassword} disabled={submitting}
          onChange={e => update('confirmPassword', e.target.value)}
          trailing={<span className="flex items-center gap-1">
            <FieldCheck valid={valid.confirmar} />
            <PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          </span>} />
      </Field>

      {/* Términos */}
      <div>
        <Checkbox checked={values.aceptaTerminos}
          onChange={e => update('aceptaTerminos', e.target.checked)}
          label={<>Estoy de acuerdo con los{' '}
            <Link to="/terminos" className="font-bold text-brand hover:underline">
              Términos y condiciones
            </Link>
          </>} />
        {errors.aceptaTerminos && <p className="mt-1 text-xs text-danger">{errors.aceptaTerminos}</p>}
      </div>

      <SecurityVerification resetKey={securityKey} onToken={setSecurityToken} />

      <Button type="submit" disabled={submitting || !dniEstaValidado || !securityToken}
        className="w-full justify-center disabled:opacity-60">
        {submitting ? 'Registrando…' : 'Registrar'}
      </Button>
    </form>
  )
}