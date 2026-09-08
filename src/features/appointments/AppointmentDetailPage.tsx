import { useNavigate, useParams } from 'react-router-dom'
import { BackLink, Button, Card, Icon } from '@/components/ui'
import { parseId } from '@/lib/id'
import { useData } from '@/store/hooks'
import { AppointmentSummary } from './components/AppointmentSummary'
import { PaymentForm } from './components/PaymentForm'
import type { PaymentInput } from './types'

/** Pantalla completa: datos de la cita y registro del pago. */
export function AppointmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { appointmentById, savePayment } = useData()
  const appointment = id ? appointmentById(parseId(id)) : undefined

  if (!appointment) {
    return (
      <>
        <BackLink to="/citas">Volver a Citas</BackLink>
        <Card className="grid place-items-center gap-3 px-6 py-20 text-center text-muted">
          <Icon name="warning" size={28} />
          <p className="text-[0.95rem]">Esta cita no existe o fue eliminada.</p>
        </Card>
      </>
    )
  }

  /** Guarda y vuelve al listado, donde la fila ya refleja el nuevo pago. */
  const handleSave = (input: PaymentInput) => {
    savePayment(appointment.id, input)
    navigate('/citas')
  }

  return (
    <>
      <BackLink to="/citas">Volver a Citas</BackLink>

      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[1.9rem] leading-tight font-bold tracking-tight">Detalle de la cita</h1>
        <Button variant="ghost" icon="printer" onClick={() => window.print()} className="print:hidden">
          Imprimir
        </Button>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <AppointmentSummary appointment={appointment} />
        <PaymentForm appointment={appointment} onSubmit={handleSave} />
      </div>
    </>
  )
}
