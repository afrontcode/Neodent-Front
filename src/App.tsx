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
import { UserDetailPage } from '@/features/users/UserDetailPage'
import { PATIENT_ROLES, STAFF_ROLES, type Role } from '@/features/users/types'
import { TwoFactorPage } from '@/features/auth/TwoFactorPage'
import { ForbiddenPage } from '@/features/errors/ForbiddenPage'
import { NotFoundPage } from '@/features/errors/NotFoundPage'
import { MyProfilePage } from '@/features/auth/MyProfilePage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage'
import { RestartVerificationPage } from '@/features/auth/RestartVerificationPage'
import { NewUserPage } from '@/features/users/NewUserPage'
import { AccountActivationPage } from '@/features/auth/AccountActivationPage'

const ADMIN_ROLES: readonly Role[] = ['Administrador']

export default function App() {
  return (
    <Routes>
      {/* Pantallas públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verificar-2fa" element={<TwoFactorPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verificar-correo" element={<VerifyEmailPage />} />
        <Route path="/activar-cuenta-pendiente" element={<RestartVerificationPage />} />
        <Route path="/terminos" element={<Placeholder title="Términos y condiciones" />} />
        <Route path="/activar-personal" element={<AccountActivationPage type="staff" />} />
        <Route path="/activate-account" element={<AccountActivationPage type="patient" />} />
      </Route>

      {/* Panel del centro: personal interno */}
      <Route element={<RequireAuth roles={STAFF_ROLES} />}>
        <Route element={<AppShell />}>
          <Route path="/citas" element={<AppointmentsPage />} />
          <Route path="/citas/nueva" element={<Placeholder title="Agendar cita" />} />
          <Route path="/citas/:id" element={<AppointmentDetailPage />} />
          <Route
            path="/citas/:id/reprogramar"
            element={<Placeholder title="Reprogramar cita" />}
          />

          <Route
            path="/pacientes"
            element={
              <Placeholder
                title="Pacientes"
                description="Listado de pacientes del centro."
              />
            }
          />
          <Route
            path="/pacientes/:id"
            element={<Placeholder title="Ficha del paciente" />}
          />

          {/* Administración de usuarios: solo ADMIN */}
          <Route element={<RequireAuth roles={ADMIN_ROLES} />}>
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/usuarios/nuevo" element={<NewUserPage />} />
            <Route path="/usuarios/:id" element={<UserDetailPage />} />
            <Route
              path="/usuarios/:id/editar"
              element={<Placeholder title="Editar usuario" />}
            />
          </Route>
        </Route>
      </Route>

      {/* Portal del paciente */}
      <Route element={<RequireAuth roles={PATIENT_ROLES} />}>
        <Route element={<AppShell />}>
          <Route path="/mis-citas" element={<MyAppointmentsPage />} />
          <Route path="/mis-citas/nueva" element={<NewAppointmentPage />} />
          <Route
            path="/mis-citas/nueva/fecha-y-hora"
            element={<NewAppointmentSchedulePage />}
          />
          <Route
            path="/mis-citas/nueva/confirmar"
            element={
              <Placeholder
                title="Confirmar cita"
                description="Paso 3 de la reserva: revisa y confirma los datos."
              />
            }
          />
          <Route
            path="/mis-citas/:id/reprogramar"
            element={<Placeholder title="Reprogramar cita" />}
          />
        </Route>
      </Route>

      {/* Cualquier usuario autenticado */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route element={<AppShell />}>
          <Route path="/perfil" element={<MyProfilePage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}