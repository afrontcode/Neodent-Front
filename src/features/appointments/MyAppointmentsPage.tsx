import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, ConfirmDialog, Icon, PageHead, Tabs, type TabItem } from '@/components/ui'
import { TODAY } from '@/lib/constants'
import type { Id } from '@/lib/id'
import { useAuth } from '@/features/auth/hooks'
import { useData } from '@/store/hooks'
import { MyAppointmentCard } from './components/MyAppointmentCard'
import { compareAppointments } from './utils'
import { canActOn, type Appointment } from './types'

type TabValue = 'proximas' | 'historial'

const TABS: readonly TabItem<TabValue>[] = [
  { value: 'proximas', label: 'Próximas citas' },
  { value: 'historial', label: 'Historial' },
]

/**
 * Una cita sigue siendo "próxima" mientras no haya pasado y conserve una fecha
 * vigente; las canceladas y atendidas se archivan en el historial.
 */
const isUpcoming = (a: Appointment) => a.fecha >= TODAY && canActOn(a)

export function MyAppointmentsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { appointments, docName, docEsp, cancelAppointment } = useData()

  /** Se llega con este aviso al terminar de reservar una cita. */
  const creada: boolean = location.state?.creada ?? false

  const [tab, setTab] = useState<TabValue>('proximas')
  /** Cita cuya cancelación está pendiente de confirmar. */
  const [toCancel, setToCancel] = useState<Appointment | null>(null)

  const pacId: Id | undefined = user?.pacId

  const rows = useMemo(() => {
    if (pacId == null) return []
    return appointments
      .filter((a) => a.pacId === pacId && (tab === 'proximas' ? isUpcoming(a) : !isUpcoming(a)))
      .sort(compareAppointments)
  }, [appointments, pacId, tab])

  const confirmCancel = () => {
    if (toCancel) cancelAppointment(toCancel.id)
    setToCancel(null)
  }

  return (
    <>
      <PageHead
        title="Mis citas"
        actions={
          <Button icon="plus" onClick={() => navigate('/mis-citas/nueva')}>
            Agendar cita
          </Button>
        }
      />

      {creada && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2.5 rounded-control border border-success/30 bg-success-soft px-4 py-3 text-[0.9rem] text-success"
        >
          <Icon name="check" size={18} strokeWidth={2.4} />
          Tu cita quedó registrada. Te esperamos el día programado.
        </div>
      )}

      <Tabs items={TABS} value={tab} onChange={setTab} label="Filtrar mis citas" />

      <div className="mt-5 flex flex-col gap-4">
        {rows.map((a) => (
          <MyAppointmentCard
            key={a.id}
            appointment={a}
            doctor={docName(a.docId)}
            especialidad={docEsp(a.docId)}
            onReschedule={() => navigate(`/mis-citas/${a.id}/reprogramar`)}
            onCancel={() => setToCancel(a)}
          />
        ))}

        {rows.length === 0 && (
          <Card className="grid place-items-center gap-3 px-6 py-16 text-center text-muted">
            <Icon name="calendar" size={28} />
            <p className="text-[0.95rem]">
              {tab === 'proximas'
                ? 'No tienes citas programadas. Agenda una para empezar.'
                : 'Todavía no tienes citas en tu historial.'}
            </p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={toCancel !== null}
        title="¿Estás seguro de cancelar la cita?"
        description="Esta acción es irreversible."
        cancelLabel="Regresar"
        confirmLabel="Aceptar"
        onCancel={() => setToCancel(null)}
        onConfirm={confirmCancel}
      />
    </>
  )
}
