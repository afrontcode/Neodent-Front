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
