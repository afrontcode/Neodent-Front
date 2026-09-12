import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Placeholder } from '@/components/ui'
import { HomeRedirect } from '@/features/auth/HomeRedirect'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { AppointmentDetailPage } from '@/features/appointments/AppointmentDetailPage'
import { MyAppointmentsPage } from '@/features/appointments/MyAppointmentsPage'
import { NewAppointmentPage } from '@/features/appointments/NewAppointmentPage'
import { NewAppointmentSchedulePage } from '@/features/appointments/NewAppointmentSchedulePage'
import { UsersPage } from '@/features/users/UsersPage'
import { STAFF_ROLES } from '@/features/users/types'

const PATIENT_ROLES = ['Paciente'] as const

export default function App() {
  return (
    <Routes>
      {/* Pantallas públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<Placeholder title="Recuperar contraseña" />} />
        <Route path="/verificar-correo" element={<Placeholder title="Verifica tu correo" description="Te enviamos un código de verificación a tu correo electrónico para confirmar tu identidad." />} />
        <Route path="/terminos" element={<Placeholder title="Términos y condiciones" />} />
      </Route>

      {/* Panel del centro: sólo el equipo */}
      <Route element={<RequireAuth roles={STAFF_ROLES} />}>
        <Route element={<AppShell />}>
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
        </Route>
      </Route>

      {/* Área del paciente: sólo sus propias citas */}
      <Route element={<RequireAuth roles={PATIENT_ROLES} />}>
        <Route element={<AppShell />}>
          <Route path="/mis-citas" element={<MyAppointmentsPage />} />
          <Route path="/mis-citas/nueva" element={<NewAppointmentPage />} />
          <Route path="/mis-citas/nueva/fecha-y-hora" element={<NewAppointmentSchedulePage />} />
          <Route path="/mis-citas/nueva/confirmar" element={<Placeholder title="Confirmar cita" description="Paso 3 de la reserva: revisa y confirma los datos." />} />
          <Route path="/mis-citas/:id/reprogramar" element={<Placeholder title="Reprogramar cita" />} />
        </Route>
      </Route>

      {/* Con sesión, pero sin pantalla propia: la raíz y lo no encontrado */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<AppShell />}>
          <Route path="*" element={<Placeholder title="Página no encontrada" />} />
        </Route>
      </Route>
    </Routes>
  )
}
