import { apiRequest } from './apiClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  requiresTwoFactor: boolean
  challengeId: number | null
  message: string
}

export interface VerifyTwoFactorRequest {
  challengeId: number
  codigo: string
}

export interface VerifyTwoFactorResponse {
  verified: boolean
  accessToken: string
  tokenType: string
  expiresIn: number
  message: string
}

export interface RefreshTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  message: string
}

export interface ResendCodeResponse {
  challengeId: number
  message: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ValidatePasswordResetResponse {
  valid: boolean
  message: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface AuthenticatedUserResponse {
  idUsuario: number
  correo: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  roles: string[]
  estado: string
  idPersonal: number | null
  idPaciente: number | null
}

export interface PatientRegistrationCheckResponse {
  dni: string
  nombres: string | null
  apellidoPaterno: string | null
  apellidoMaterno: string | null
  manualEntryRequired: boolean
}

export interface PatientRegistrationRequest {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  fechaNacimiento: string | null
  telefono: string
  email: string
  direccion: string | null
  password: string
  turnstileToken: string
}

export interface PatientRegistrationResponse {
  pacienteId: number
  usuarioId: number
  challengeId: number
  message: string
}

export interface VerifyRegistrationEmailResponse {
  verified: boolean
  message: string
}

export interface StaffInvitationResponse {
  valid: boolean
  nombrePaciente: string
  emailMasked: string
}
export interface StaffActivationStartResponse {
  challengeId: number
  emailMasked: string
  message: string
}
export interface StaffActivationCompleteResponse {
  usuarioId: number
  pacienteId: number | null
  message: string
}

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })
  },

  verifyTwoFactor(challengeId: number, codigo: string) {
    return apiRequest<VerifyTwoFactorResponse>(
      '/api/auth/verify-2fa',
      {
        method: 'POST',
        body: JSON.stringify({
          challengeId,
          codigo,
        }),
      },
    )
  },

  resendCode(challengeId: number) {
    return apiRequest<ResendCodeResponse>('/api/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({
        challengeId,
      }),
    })
  },

  refresh() {
    return apiRequest<RefreshTokenResponse>('/api/auth/refresh', {
      method: 'POST',
    })
  },

  logout() {
    return apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    })
  },

  forgotPassword(correo: string) {
    return apiRequest<ForgotPasswordResponse>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({
          correo,
        }),
      },
    )
  },

  validatePasswordReset(token: string) {
    return apiRequest<ValidatePasswordResetResponse>(
      '/api/auth/reset-password/validate',
      {
        method: 'POST',
        body: JSON.stringify({
          token,
        }),
      },
    )
  },

  resetPassword(
    token: string,
    nuevaContrasena: string,
    confirmarContrasena: string,
  ) {
    return apiRequest<ResetPasswordResponse>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({
          token,
          nuevaContrasena,
          confirmarContrasena,
        }),
      },
    )
  },

  me(accessToken: string) {
    return apiRequest<AuthenticatedUserResponse>('/api/auth/me', {
      method: 'GET',
      accessToken,
    })
  },

  checkPatientDni(dni: string, turnstileToken: string) {
    return apiRequest<PatientRegistrationCheckResponse>(
      '/api/auth/patient-registration/check-dni',
      {
        method: 'POST',
        body: JSON.stringify({
          dni,
          turnstileToken,
        }),
      },
    )
  },

  registerPatient(data: PatientRegistrationRequest) {
    return apiRequest<PatientRegistrationResponse>(
      '/api/auth/patient-registration',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    )
  },

  verifyRegistrationEmail(challengeId: number, codigo: string) {
    return apiRequest<VerifyRegistrationEmailResponse>(
      '/api/auth/patient-registration/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({
          challengeId,
          codigo,
        }),
      },
    )
  },

  restartRegistrationVerification(email: string, password: string, turnstileToken: string) {
    return apiRequest<ResendCodeResponse>('/api/auth/patient-registration/restart-verification', {
      method: 'POST',
      body: JSON.stringify({ email, password, turnstileToken }),
    })
  },

    validateStaffInvitation(token: string) {
    return apiRequest<StaffInvitationResponse>('/api/auth/staff-activation/validate', {
      method: 'POST', body: JSON.stringify({ token }),
    })
  },

  startStaffActivation(token: string, numeroDocumento: string, turnstileToken: string) {
    return apiRequest<StaffActivationStartResponse>('/api/auth/staff-activation/start', {
      method: 'POST',
      body: JSON.stringify({ token, tipoDocumento: 'DNI', numeroDocumento, turnstileToken }),
    })
  },

  completeStaffActivation(token: string, challengeId: number, codigo: string, password: string) {
    return apiRequest<StaffActivationCompleteResponse>('/api/auth/staff-activation/complete', {
      method: 'POST', body: JSON.stringify({ token, challengeId, codigo, password }),
    })
  },

    validatePatientInvitation(token: string) {
    return apiRequest<StaffInvitationResponse>(
      '/api/auth/account-activation/validate',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      },
    )
  },

  startPatientActivation(
    token: string,
    numeroDocumento: string,
    turnstileToken: string,
  ) {
    return apiRequest<StaffActivationStartResponse>(
      '/api/auth/account-activation/start',
      {
        method: 'POST',
        body: JSON.stringify({
          token,
          tipoDocumento: 'DNI',
          numeroDocumento,
          turnstileToken,
        }),
      },
    )
  },

  completePatientActivation(
    token: string,
    challengeId: number,
    codigo: string,
    password: string,
  ) {
    return apiRequest<StaffActivationCompleteResponse>(
      '/api/auth/account-activation/complete',
      {
        method: 'POST',
        body: JSON.stringify({ token, challengeId, codigo, password }),
      },
    )
  },
}