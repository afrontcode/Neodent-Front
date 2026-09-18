/** Datos que envía el formulario de inicio de sesión. */
export interface Credentials {
  correo: string
  password: string
  /** Mantener la sesión al cerrar el navegador. */
  recordarme: boolean
}

export const DOCUMENT_TYPES = ['DNI', 'Carné de Extranjería', 'Pasaporte'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

/** Datos que envía el formulario de registro. */
export interface RegisterInput {
  tipoDocumento: DocumentType
  numeroDocumento: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  /** Fecha en formato ISO (yyyy-mm-dd). */
  fechaNacimiento: string
  telefono: string
  correo: string
  password: string
  confirmPassword: string
  aceptaTerminos: boolean
}

/** Desde dónde se llegó a la verificación: cambia el texto y a dónde se vuelve. */
export type VerificationReason = 'registro' | 'login'

/** Verificación de correo en curso, a la espera de que se ingrese el código. */
export interface PendingVerification {
  correo: string
  motivo: VerificationReason
  /** Sólo en 'login': mantener la sesión al terminar de verificar. */
  recordarme: boolean
}

/** Resultado de `login`: o quedó la sesión abierta, o falta verificar el correo. */
export type LoginOutcome = 'ok' | 'verificar'
