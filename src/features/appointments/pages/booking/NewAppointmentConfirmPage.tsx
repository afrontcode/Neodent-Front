import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Icon } from '@/shared/components/ui'
import { useAuth } from '@/features/auth/model/useAuth'
import { ApiError } from '@/shared/api/apiClient'
import { BookingLayout } from '../../components/booking/BookingLayout'
import { bookingApi, type CreatedAppointment } from '../../api/bookingApi'
import { citaReferencia } from '../../model/citaReferencia'

type HoldDraft = {
  servicioId: number; servicioNombre: string; especialidadId: number
  sedeId: number; sedeNombre: string; sedeDireccion: string
  odontologoEspecialidadId: number; odontologoNombre: string
  fecha: string; hora: string; tokenReserva: string; venceEnMs: number;
  duracionMinutos?: number | null; precioReferencial?: number | null
}

const reservasLiberadas = new Set<string>()
const reservasConfirmadas = new Set<string>()

const formatoFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'full' }).format(new Date(`${fecha}T12:00:00`))

const tiempoRestante = (venceEnMs: number) =>
  Math.max(0, Math.ceil((venceEnMs - Date.now()) / 1000))

export function NewAppointmentConfirmPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { accessToken } = useAuth()

  const reserva = state as HoldDraft | null
  const token = reserva?.tokenReserva ?? ''
  const venceEnMs = reserva?.venceEnMs ?? 0

  const [restante, setRestante] = useState(() => tiempoRestante(venceEnMs))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [cita, setCita] = useState<CreatedAppointment | null>(null)

  const montado = useRef(false)
  const confirmando = useRef(false)
  const confirmado = useRef(false)
  const liberado = useRef(false)

  const liberar = useCallback((keepalive = false) => {
    if (!accessToken || !token || confirmado.current || confirmando.current) return
    if (liberado.current || reservasLiberadas.has(token)) return

    liberado.current = true
    reservasLiberadas.add(token)

    void bookingApi.liberar(accessToken, token, keepalive).catch(() => {
      // Si falla la liberación, el backend conserva la expiración automática.
    })
  }, [accessToken, token])

const formatoHora = (hora: string) => {
  const [h, m] = hora.split(':').map(Number)
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

  useEffect(() => {
    montado.current = true

    const actualizar = () => setRestante(tiempoRestante(venceEnMs))
    actualizar()

    const intervalo = window.setInterval(actualizar, 500)
    const salir = () => liberar(true)

    window.addEventListener('pagehide', salir)

    return () => {
      montado.current = false
      window.clearInterval(intervalo)
      window.removeEventListener('pagehide', salir)

      queueMicrotask(() => {
        if (!montado.current) liberar()
      })
    }
  }, [venceEnMs, liberar])

  const regresar = () => {
    if (guardando || confirmando.current) return

    liberar()

    if (!reserva) {
      navigate('/mis-citas/nueva', { replace: true })
      return
    }

    const {servicioId, servicioNombre, especialidadId, duracionMinutos, precioReferencial,sedeId, sedeNombre, sedeDireccion} = reserva

    navigate('/mis-citas/nueva/fecha-y-hora', {
      replace: true,
      state: { servicioId, servicioNombre, especialidadId, duracionMinutos, precioReferencial,sedeId, sedeNombre, sedeDireccion, },
    })
  }

  const confirmar = async () => {
    if (!accessToken || !reserva || confirmado.current || confirmando.current) return
    if (liberado.current || reservasLiberadas.has(token) || tiempoRestante(venceEnMs) <= 0) return

    confirmando.current = true
    setGuardando(true)
    setError('')

    try {
      const creada = await bookingApi.confirmar(accessToken, token)

      confirmado.current = true
      reservasConfirmadas.add(token)

      if (montado.current) setCita(creada)
    } catch (e) {
      if (montado.current) {
        if (e instanceof ApiError && [404, 409].includes(e.status)) {
          setRestante(0)
          setError('La reserva expiró o el horario ya no está disponible. Selecciona otro horario.')
        } else {
          setError(e instanceof Error ? e.message : 'No se pudo confirmar la cita. Inténtalo nuevamente.')
        }
      }
    } finally {
      confirmando.current = false

      if (montado.current) setGuardando(false)
      else liberar()
    }
  }

  if (!reserva?.servicioId || !reserva?.sedeId || !token || !Number.isFinite(venceEnMs) || venceEnMs <= 0) {
    return <Navigate to="/mis-citas/nueva" replace />
  }

  if (reservasConfirmadas.has(token) && !cita) {
    return <Navigate to="/mis-citas" replace />
  }

  if (reservasLiberadas.has(token) && !cita) {
    return <Navigate to="/mis-citas/nueva/fecha-y-hora" state={reserva} replace />
  }

  return (
    <BookingLayout
      step={2}
      footer={cita ? (
        <>
            <Button variant="ghost" onClick={() => navigate('/mis-citas', { replace: true })}>
            Ver mis citas
            </Button>

            <Button onClick={() => navigate(`/mis-citas/${cita.idCita}`, { replace: true })}>
            Ver detalle
            </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={regresar} disabled={guardando}>
            Elegir otro horario
          </Button>

          <Button onClick={() => void confirmar()} disabled={guardando || restante <= 0 || !accessToken}>
            {guardando ? 'Confirmando…' : 'Confirmar mi cita'}
          </Button>
        </>
      )}
    >
      <section className="mt-6 rounded-card border border-line bg-surface px-7 py-7 shadow-card max-sm:px-5">

        {cita ? (
          <div role="status" className="text-center">
            <Icon name="checkCircle" size={48} className="mx-auto text-brand" />

            <h2 className="mt-3 text-xl font-bold text-ink">
              ¡Tu cita fue programada!
            </h2>

            <p className="mt-2 text-sm text-muted">
              Tu cita se registró correctamente. Tu referencia de reserva es {citaReferencia(cita.idCita)}.
            </p>

            <p className="mt-1 text-sm text-muted">
              Puedes consultar los detalles desde Mis citas.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-ink">
              Revisa y confirma tu cita
            </h2>

            <p className="mt-2 text-sm text-muted">
              Verifica los datos de tu reserva antes de confirmarla.
            </p>

            <div className="mt-5 rounded-card border border-brand bg-brand-soft p-5 text-center"
              role="timer" aria-label="Tiempo restante de reserva">

              <Icon name="clock" size={28} className="mx-auto text-brand" />

              <p className="mt-2 text-sm font-medium text-ink">
                Tu horario está reservado temporalmente
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums text-brand">
                {String(Math.floor(restante / 60)).padStart(2, '0')}:
                {String(restante % 60).padStart(2, '0')}
              </p>

              <p className="mt-2 text-sm text-muted">
                {restante > 0
                  ? 'Confirma tu cita antes de que finalice el tiempo.'
                  : 'El tiempo de reserva ha finalizado. Selecciona otro horario.'}
              </p>
            </div>
          </>
        )}

        <h3 className="mt-7 text-[1.05rem] font-bold text-ink">
          Resumen de tu cita
        </h3>

        <dl className="mt-4 grid gap-5 rounded-card bg-alt p-5 text-sm sm:grid-cols-2">
          {([
            ['Servicio', reserva.servicioNombre],
            ['Especialista', reserva.odontologoNombre],
            ['Sede', reserva.sedeNombre],
            ['Dirección', reserva.sedeDireccion],
            ['Fecha', formatoFecha(reserva.fecha)],
            ['Hora', formatoHora(reserva.hora)],
            ['Duración estimada', reserva.duracionMinutos != null ? `${reserva.duracionMinutos} minutos` : 'Por definir'],
            ['Precio referencial', reserva.precioReferencial != null ? `S/ ${reserva.precioReferencial.toFixed(2)}` : 'Por definir'],
          ] as const).map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="mt-1 font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          El precio mostrado es referencial. El importe definitivo
          se determinará según los servicios realizados durante la atención.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-danger">
            {error}
          </p>
        )}
      </section>
    </BookingLayout>
  )
}