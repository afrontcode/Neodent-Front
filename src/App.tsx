import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Placeholder } from '@/components/ui'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { AppointmentDetailPage } from '@/features/appointments/AppointmentDetailPage'
import { UsersPage } from '@/features/users/UsersPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/citas" replace />} />

        <Route path="/citas" element={<AppointmentsPage />} />
        <Route path="/citas/nueva" element={<Placeholder title="Agendar cita" />} />
        <Route path="/citas/:id" element={<AppointmentDetailPage />} />
        <Route path="/citas/:id/reprogramar" element={<Placeholder title="Reprogramar cita" />} />

        <Route path="/pacientes" element={<Placeholder title="Pacientes" description="Listado de pacientes del centro." />} />
        <Route path="/pacientes/:id" element={<Placeholder title="Ficha del paciente" />} />

        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/usuarios/nuevo" element={<Placeholder title="Nuevo usuario" />} />
        <Route path="/usuarios/:id" element={<Placeholder title="Detalle del usuario" />} />
        <Route path="/usuarios/:id/editar" element={<Placeholder title="Editar usuario" />} />

        <Route path="*" element={<Placeholder title="Página no encontrada" />} />
      </Routes>
    </AppShell>
  )
}
