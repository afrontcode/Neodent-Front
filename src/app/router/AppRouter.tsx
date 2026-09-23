import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layouts/AppShell'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Placeholder } from '@/shared/components/ui'
import {
  HomeRedirect,
  LoginPage,
  RegisterPage,
  RequireAuth,
  TwoFactorPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  RestartVerificationPage,
  AccountActivationPage,
  MyProfilePage,
} from '@/features/auth'
import {
  AppointmentsPage,
  AppointmentDetailPage,
  MyAppointmentsPage,
  NewAppointmentPage,
  NewAppointmentSchedulePage,
} from '@/features/appointments'
import { UsersPage, UserDetailPage, NewUserPage } from '@/features/users'
import { DashboardPage } from '@/features/dashboard'
import { ForbiddenPage } from '@/app/pages/ForbiddenPage'
import { NotFoundPage } from '@/app/pages/NotFoundPage'
import { PATIENT_ROLES, STAFF_ROLES, type Role } from '@/domain/identity'

const ADMIN_ROLES: readonly Role[] = ['Administrador']

export function AppRouter() {
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<MyProfilePage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
