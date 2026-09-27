import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useLocation, useParams } from 'react-router-dom'
import { BackLink, Badge, Button, Card, Icon } from '@/shared/components/ui'
import { useAuth } from '@/features/auth/model/useAuth'
import { citaDetalleApi, type DetalleCita } from '../api/citaDetalleApi'
import { citaReferencia } from '../model/citaReferencia'

const fechaFormato = (fecha: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'full' }).format(new Date(`${fecha.slice(0, 10)}T12:00:00`))

const horaFormato = (fecha: string) => {
  const [h, m] = fecha.slice(11, 16).split(':').map(Number)
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

const tonoEstado = (estado: string): 'green' | 'blue' | 'red' | 'gray' => {
  if (estado === 'CONFIRMADA' || estado === 'ATENDIDA') return 'green'
  if (estado === 'PROGRAMADA' || estado === 'EN_ATENCION') return 'blue'
  if (estado === 'CANCELADA' || estado === 'NO_ASISTIO') return 'red'
  return 'gray'
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted">{titulo}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-ink">{valor}</dd>
    </div>
  )
}

export function AppointmentDetailPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const { accessToken } = useAuth()

  const esPaciente = pathname.startsWith('/mis-citas/')
  const volver = esPaciente ? '/mis-citas' : '/citas'
  const citaId = Number(id)
  const idValido = Number.isSafeInteger(citaId) && citaId > 0

  const [cita, setCita] = useState<DetalleCita | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actualizacion, setActualizacion] = useState(0)

  useEffect(() => {
    if (!accessToken || !idValido) {
      setCita(null)
      setError(idValido ? 'No se encontró una sesión activa.' : 'El identificador de la cita no es válido.')
      setLoading(false)
      return
    }

    let activo = true
    setLoading(true)
    setError('')

    citaDetalleApi.detalle(accessToken, citaId)
      .then(data => { if (activo) setCita(data) })
      .catch(e => {
        if (activo) {
          setCita(null)
          setError(e instanceof Error ? e.message : 'No se pudo obtener el detalle de la cita.')
        }
      })
      .finally(() => { if (activo) setLoading(false) })

    return () => { activo = false }
  }, [accessToken, citaId, idValido, actualizacion])

  return (
    <>
      <BackLink to={volver}>Volver a {esPaciente ? 'Mis citas' : 'Citas'}</BackLink>

      <header className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.8rem] font-bold tracking-tight text-ink">Detalle de la cita</h1>
          <p className="mt-1 text-sm text-muted">Consulta la información de tu reserva.</p>
        </div>

        {cita && !loading && (
          <Button variant="ghost" icon="printer" onClick={() => window.print()} className="print:hidden">
            Imprimir
          </Button>
        )}
      </header>

      {loading && (
        <Card className="flex items-center justify-center gap-3 p-12">
          <Icon name="spinner" size={22} className="animate-spin text-brand" />
          <p className="text-sm text-muted">Cargando información de la cita…</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Icon name="warning" size={32} className="text-danger" />
          <p role="alert" className="text-sm text-danger">{error}</p>
          <Button variant="ghost" onClick={() => setActualizacion(n => n + 1)}>Intentar nuevamente</Button>
        </Card>
      )}

      {!loading && cita && !error && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">

          {/* INFORMACIÓN PRINCIPAL */}
          <Card className="overflow-hidden p-0">
            <div className="border-b border-line bg-brand-soft/50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-brand">
                  REFERENCIA: {citaReferencia(cita.idCita)}
                </span>
                <Badge tone={tonoEstado(cita.estado)}>{cita.estado.replaceAll('_', ' ')}</Badge>
              </div>

              <h2 className="mt-4 text-xl font-bold text-ink">{cita.servicioNombre}</h2>
              <p className="mt-1 text-sm text-muted">{cita.especialidadNombre}</p>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-ink">Información de la atención</h3>

              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <Dato titulo="Fecha de atención" valor={fechaFormato(cita.fechaHoraInicio)} />
                <Dato titulo="Hora de inicio" valor={horaFormato(cita.fechaHoraInicio)} />
                <Dato titulo="Hora de finalización" valor={horaFormato(cita.fechaHoraFin)} />
                <Dato titulo="Especialista" valor={`Dr(a). ${cita.odontologoNombre}`} />
              </dl>

              <div className="mt-6 border-t border-line pt-5">
                <h3 className="font-bold text-ink">Lugar de atención</h3>

                <div className="mt-4 flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon name="calendar" size={19} />
                  </div>

                  <div>
                    <p className="font-semibold text-ink">{cita.sedeNombre}</p>
                    <p className="mt-1 text-sm text-muted">{cita.sedeDireccion}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* INFORMACIÓN ADICIONAL */}
          <div className="space-y-5">

            {!esPaciente && (
              <Card className="p-6">
                <h3 className="font-bold text-ink">Información del paciente</h3>

                <dl className="mt-4">
                  <Dato titulo="Paciente" valor={cita.pacienteNombre} />
                </dl>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon name="calendar" size={20} />
                </span>

                <h3 className="font-bold text-ink">Pago y comprobante</h3>
              </div>

              <div className="mt-5 rounded-xl bg-alt p-4">
                <p className="text-sm leading-relaxed text-muted">
                  La consulta del pago y la descarga del comprobante
                  todavía no están habilitadas en el portal.
                </p>
              </div>
            </Card>

          </div>
        </motion.div>
      )}
    </>
  )
}