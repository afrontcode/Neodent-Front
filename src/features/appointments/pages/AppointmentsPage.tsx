import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { AnimatedDatePicker, AppointmentsTableSkeleton, Badge, Button, Card, Icon, PageHead, SearchInput, TableFoot } from '@/shared/components/ui'
import { apiRequest } from '@/shared/api/apiClient'
import { useAuth } from '@/features/auth/model/useAuth'
import { citaDetalleApi, type DetalleCita } from '../api/citaDetalleApi'
import { citaReferencia } from '../model/citaReferencia'
import type { CreatedAppointment } from '../api/bookingApi'

interface PaginaCitas {
  contenido: CreatedAppointment[]
  esUltima: boolean
}

const fechaFormato = (fecha: string) =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(`${fecha.slice(0, 10)}T12:00:00`))

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

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()

  const [citas, setCitas] = useState<DetalleCita[]>([])
  const [query, setQuery] = useState('')
  const [day, setDay] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actualizacion, setActualizacion] = useState(0)

  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      setError('No se encontró una sesión activa.')
      return
    }

    let activo = true

    const cargar = async () => {
      setLoading(true)
      setError('')

      try {
        let resultado: DetalleCita[] = []

        if (user?.rol === 'Odontólogo') {
          const citasPropias: CreatedAppointment[] = []
          let pagina = 0
          let ultima = false

          while (!ultima) {
            const respuesta = await apiRequest<PaginaCitas>(
              `/api/citas/mi-agenda?pagina=${pagina}&tamano=50`, { accessToken }
            )

            citasPropias.push(...respuesta.contenido)
            ultima = respuesta.esUltima || respuesta.contenido.length === 0
            pagina++
          }

          resultado = await Promise.all(
            citasPropias.map(c => citaDetalleApi.detalle(accessToken, c.idCita))
          )
        } else {
          resultado = await citaDetalleApi.agenda(accessToken)
        }

        if (activo) setCitas(resultado)
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar las citas.')
      } finally {
        if (activo) setLoading(false)
      }
    }

    void cargar()
    return () => { activo = false }
  }, [accessToken, user?.rol, actualizacion])

  const rows = useMemo(() => {
    const buscar = query.trim().toLowerCase()

    return citas.filter(c => {
      if (day && c.fechaHoraInicio.slice(0, 10) !== day) return false
      if (!buscar) return true

      return `${c.pacienteNombre} ${c.odontologoNombre} ${c.servicioNombre} ${citaReferencia(c.idCita)}`
        .toLowerCase().includes(buscar)
    }).sort((a, b) => b.fechaHoraInicio.localeCompare(a.fechaHoraInicio))
  }, [citas, query, day])

  return (
    <>
      <PageHead
        title="Citas"
        description="Consulta las citas registradas y la programación de atención del centro."
        actions={
          <Button variant="ghost" onClick={() => setActualizacion(n => n + 1)} disabled={loading}>
            <Icon name="calendar" size={17} />
            Actualizar
          </Button>
        }
      />

      <Card className="overflow-visible">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Buscar paciente, especialista o referencia..."
            aria-label="Buscar citas"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            className="w-full sm:min-w-[12rem] sm:flex-1"
          />

          <AnimatedDatePicker
            label="Filtrar por fecha"
            placeholder="Filtrar por fecha"
            value={day}
            onChange={setDay}
            className="w-full sm:w-52 sm:shrink-0"
          />
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p role="alert" className="text-sm text-danger">{error}</p>
            <Button variant="ghost" className="mt-4" onClick={() => setActualizacion(n => n + 1)}>
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-line bg-alt text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-4">Referencia</th>
                    <th className="px-5 py-4">Paciente</th>
                    <th className="px-5 py-4">Especialista</th>
                    <th className="px-5 py-4">Fecha y hora</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {loading ? (
                    <AppointmentsTableSkeleton rows={5} />
                  ) : (
                    rows.map((cita, index) => (
                      <motion.tr
                        key={cita.idCita}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.15) }}
                        className="hover:bg-alt/60"
                      >
                        <td className="px-5 py-4 font-semibold text-brand">{citaReferencia(cita.idCita)}</td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-ink">{cita.pacienteNombre}</p>
                          <p className="mt-1 text-xs text-muted">{cita.servicioNombre}</p>
                        </td>

                        <td className="px-5 py-4 text-ink">{cita.odontologoNombre}</td>

                        <td className="px-5 py-4 text-ink">
                          {fechaFormato(cita.fechaHoraInicio)}
                          <p className="mt-1 text-xs text-muted">{horaFormato(cita.fechaHoraInicio)}</p>
                        </td>

                        <td className="px-5 py-4">
                          <Badge tone={tonoEstado(cita.estado)}>{cita.estado.replaceAll('_', ' ')}</Badge>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Button variant="ghost" onClick={() => navigate(`/citas/${cita.idCita}`)}>
                            <Icon name="eye" size={17} />
                            Ver detalle
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && rows.length === 0 && (
              <div className="p-10 text-center text-sm text-muted">
                No se encontraron citas con los filtros seleccionados.
              </div>
            )}

            <TableFoot summary={loading ? 'Cargando citas…' : `${rows.length} cita${rows.length === 1 ? '' : 's'}`} />
          </>
        )}
      </Card>
    </>
  )
}