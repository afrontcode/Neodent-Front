import { useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Button, Checkbox, Icon, type IconName } from '@/components/ui'
import { longDate, money, time12h } from '@/lib/format'
import { avatarSeed, fullName } from '@/lib/people'
import { useAuth } from '@/features/auth/hooks'
import { useData } from '@/store/hooks'
import { BookingLayout } from './components/BookingLayout'
import { branchByName, serviceById, type ScheduleDraft } from './catalog'

/** Círculo con el icono que encabeza cada dato del resumen. */
function Bubble({ name }: { name: IconName }) {
  return (
    <span className="grid size-11 flex-none place-items-center rounded-full bg-brand-soft text-brand">
      <Icon name={name} size={22} />
    </span>
  )
}

interface SummaryRowProps {
  /** Icono o avatar a la izquierda. */
  leading: ReactNode
  label: string
  value: ReactNode
  detail?: ReactNode
}

/** Fila del resumen: qué se reservó, con quién, cuándo y dónde. */
function SummaryRow({ leading, label, value, detail }: SummaryRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line px-4 py-4">
      {leading}
      <div className="min-w-0">
        <div className="text-[0.82rem] text-muted">{label}</div>
        <div className="font-bold text-ink">{value}</div>
        {detail && <div className="mt-0.5 text-[0.85rem] text-muted">{detail}</div>}
      </div>
    </div>
  )
}

/** Dato del paciente en la columna lateral. */
function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-2.5 text-[0.9rem]">
      <span className="text-ink-soft">{label}</span>
      <span className="min-w-0 truncate text-right font-bold text-ink">{value}</span>
    </div>
  )
}

/** Paso 3 de la reserva: revisar todo y confirmar la cita. */
export function NewAppointmentConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { userById, patientById, createAppointment } = useData()

  /** Lo que reunieron los pasos 1 y 2. Sin eso no hay nada que confirmar. */
  const draft = location.state as ScheduleDraft | null

  const [acepta, setAcepta] = useState(false)

  if (!draft) return <Navigate to="/mis-citas/nueva" replace />

  const servicio = serviceById(draft.servicio)
  const sede = branchByName(draft.sede)
  const doctor = userById(draft.docId)
  const pacId = user?.pacId
  const paciente = pacId != null ? patientById(pacId) : undefined
  const precio = servicio?.precio ?? null

  const goBack = () => {
    navigate('/mis-citas/nueva/fecha-y-hora', {
      state: { servicio: draft.servicio, sede: draft.sede },
    })
  }

  const confirm = () => {
    if (!acepta || pacId == null) return
    createAppointment({
      pacId,
      docId: draft.docId,
      fecha: draft.fecha,
      hora: draft.hora,
      lugar: draft.sede,
      precio,
    })
    navigate('/mis-citas', { replace: true, state: { creada: true } })
  }

  return (
    <BookingLayout
      step={2}
      footer={
        <>
          <Button variant="ghost" onClick={goBack}>
            Regresar
          </Button>
          <Button onClick={confirm} disabled={!acepta} className="disabled:opacity-60">
            Confirmar cita
          </Button>
        </>
      }
    >
      <section className="mt-6 grid grid-cols-[1fr_21rem] gap-8 rounded-card border border-line bg-surface px-7 py-6 shadow-card max-lg:grid-cols-1 max-sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[1.05rem] font-bold text-ink">Revisa y confirma tu cita</h2>
          <p className="mt-1 text-[0.9rem] text-muted">
            Comprueba que los datos sean correctos antes de reservar.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <SummaryRow
              leading={<Bubble name={servicio?.icon ?? 'tooth'} />}
              label="Servicio"
              value={servicio?.nombre ?? 'Consulta'}
              detail={servicio?.detalle}
            />

            <SummaryRow
              leading={
                doctor ? (
                  <Avatar
                    nombre={doctor.nombre}
                    apellido={doctor.apellido}
                    seed={avatarSeed(doctor.id)}
                  />
                ) : (
                  <Bubble name="pacientes" />
                )
              }
              label="Especialista"
              value={doctor ? `Dr. ${fullName(doctor)}` : 'Por asignar'}
              detail={doctor?.esp}
            />

            <SummaryRow
              leading={<Bubble name="calendar" />}
              label="Fecha y hora"
              value={longDate(draft.fecha)}
              detail={time12h(draft.hora)}
            />

            <SummaryRow
              leading={<Bubble name="pacientes" />}
              label="Sede"
              value={draft.sede}
              detail={sede?.direccion}
            />
          </div>
        </div>

        <aside className="flex flex-col rounded-card bg-alt px-5 py-5">
          <h2 className="text-[1.05rem] font-bold text-ink">Datos del paciente</h2>

          <div className="mt-4 mb-3 flex items-center gap-3">
            <Avatar
              nombre={paciente?.nombre ?? user?.nombre ?? '?'}
              apellido={paciente?.apellido ?? user?.apellido ?? ''}
              seed={pacId != null ? avatarSeed(pacId) : undefined}
            />
            <div className="min-w-0">
              <div className="truncate font-bold text-ink">
                {paciente ? fullName(paciente) : user ? fullName(user) : '—'}
              </div>
              <div className="truncate text-[0.82rem] text-muted">
                {paciente?.correo ?? user?.correo ?? '—'}
              </div>
            </div>
          </div>

          <DataRow label="Celular" value={paciente?.cel ?? '—'} />
          <DataRow label="Distrito" value={paciente?.distrito ?? '—'} />

          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.95rem] text-ink-soft">Total a pagar</span>
              <strong className="text-[1.3rem] font-bold text-ink">{money(precio)}</strong>
            </div>
            <p className="mt-1 text-[0.82rem] text-muted">
              El pago se realiza en la sede el día de la cita.
            </p>
          </div>

          <Checkbox
            className="mt-5"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
            label={
              <span>
                Acepto las políticas de atención y me comprometo a avisar con{' '}
                <strong className="font-bold text-ink">24 horas</strong> de anticipación si no puedo
                asistir.
              </span>
            }
          />
        </aside>
      </section>
    </BookingLayout>
  )
}
