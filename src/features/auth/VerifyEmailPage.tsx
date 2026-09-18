import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Icon } from '@/components/ui'
import { CodeInput } from './components/CodeInput'
import { useAuth } from './hooks'
import { CODE_LENGTH, RESEND_SECONDS, TEST_CODE, maskEmail } from './verification'

/** La raíz reparte a cada rol su pantalla de inicio. */
const HOME = '/'

/**
 * Confirmación del correo con el código de un solo uso. Se llega aquí desde el
 * registro (al terminar se vuelve al login) y desde el inicio de sesión de una
 * cuenta sin verificar (al terminar se entra a la aplicación).
 */
export function VerifyEmailPage() {
  const { pending, verify, resend, cancelVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from: string = location.state?.from ?? HOME

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  /** La verificación ya terminó: no redirigir aunque `pending` quede vacío. */
  const [done, setDone] = useState(false)
  // El código se envía al entrar, así que la cuenta atrás arranca con la pantalla.
  const submittedCode = useRef('')

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  if (!pending && !done) return <Navigate to="/login" replace />

  const correo = pending?.correo ?? ''
  const desdeRegistro = pending?.motivo === 'registro'

  const submit = async (value: string) => {
    if (submitting || value.length < CODE_LENGTH) return
    submittedCode.current = value
    setSubmitting(true)
    setError(null)
    try {
      await verify(value)
      setDone(true)
      if (desdeRegistro) {
        navigate('/login', { replace: true, state: { verificado: true, correo } })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el código.')
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit(code)
  }

  const handleChange = (value: string) => {
    setCode(value)
    // Deja de señalar el error en cuanto se corrige el código rechazado.
    if (value !== submittedCode.current) setError(null)
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    try {
      await resend()
      setCode('')
      setSeconds(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="px-8 py-9 max-sm:px-5">
      <header className="mb-7 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
          <Icon name="mail" size={28} />
        </span>
        <h2 className="text-[1.5rem] font-bold text-ink">Verifica tu correo</h2>
        <p className="mt-1 text-[0.92rem] text-muted">
          Ingresa el código de {CODE_LENGTH} dígitos que enviamos a{' '}
          <strong className="font-bold text-ink">{maskEmail(correo)}</strong>
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-control border border-danger/30 bg-danger-soft px-4 py-3 text-[0.88rem] text-danger"
          >
            <Icon name="warning" size={18} />
            {error}
          </div>
        )}

        <CodeInput
          label="Código de verificación"
          length={CODE_LENGTH}
          value={code}
          onChange={handleChange}
          onComplete={submit}
          disabled={submitting}
          invalid={Boolean(error)}
          describedBy="codigo-ayuda"
        />

        {/* Mientras no haya backend el código no llega por correo: se muestra
            aquí para poder recorrer el flujo. Quitar al conectar la API. */}
        <p id="codigo-ayuda" className="text-center text-[0.82rem] text-muted">
          Código de prueba: <strong className="font-bold text-ink-soft">{TEST_CODE}</strong>
        </p>

        <Button
          type="submit"
          disabled={submitting || code.length < CODE_LENGTH}
          className="w-full justify-center disabled:opacity-60"
        >
          {submitting ? 'Verificando…' : 'Verificar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[0.9rem] text-ink-soft">
        ¿No recibiste el código?{' '}
        {seconds > 0 ? (
          <span className="text-muted">Reenviar en {seconds}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="cursor-pointer font-bold text-brand hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
          >
            {resending ? 'Enviando…' : 'Reenviar código'}
          </button>
        )}
      </p>

      <div className="my-6 flex items-center gap-3 text-[0.85rem] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        O
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="text-center text-[0.92rem] text-ink-soft">
        <Link
          to={desdeRegistro ? '/registro' : '/login'}
          onClick={cancelVerification}
          className="font-bold text-brand hover:underline"
        >
          {desdeRegistro ? 'Usar otro correo' : 'Volver al inicio de sesión'}
        </Link>
      </p>
    </Card>
  )
}
