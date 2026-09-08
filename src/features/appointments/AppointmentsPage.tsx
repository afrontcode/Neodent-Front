import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, DateField, PageHead, SearchInput, TableFoot, Toolbar } from '@/components/ui'
import { isoToDMY } from '@/lib/format'
import { useData } from '@/store/hooks'
import { AppointmentsTable } from './components/AppointmentsTable'
import { compareAppointments } from './utils'
import type { Appointment } from './types'

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { appointments, pacName, docName, cancelAppointment } = useData()

  const [query, setQuery] = useState('')
  const [day, setDay] = useState('')

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    return appointments
      .filter((a) => {
        if (day && a.fecha !== day) return false
        if (q && !pacName(a.pacId).toLowerCase().includes(q)) return false
        return true
      })
      .sort(compareAppointments)
  }, [appointments, query, day, pacName])

  const handleCancel = (a: Appointment) => {
    const ok = window.confirm(
      `¿Cancelar la cita de ${pacName(a.pacId)} del ${isoToDMY(a.fecha)} a las ${a.hora}?`,
    )
    if (ok) cancelAppointment(a.id)
  }

  return (
    <>
      <PageHead
        title="Citas"
        description="Todas las citas del centro. Reprograma o cancela según necesites."
        actions={
          <Button icon="plus" onClick={() => navigate('/citas/nueva')}>
            Agendar cita
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput
            placeholder="Buscar por paciente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <DateField value={day} onChange={setDay} />
        </Toolbar>

        <AppointmentsTable
          appointments={rows}
          pacName={pacName}
          docName={docName}
          onDetail={(a) => navigate(`/citas/${a.id}`)}
          onPatient={(a) => navigate(`/pacientes/${a.pacId}`)}
          onReschedule={(a) => navigate(`/citas/${a.id}/reprogramar`)}
          onCancel={handleCancel}
        />

        <TableFoot summary={`${rows.length} cita${rows.length === 1 ? '' : 's'}`} />
      </Card>
    </>
  )
}
