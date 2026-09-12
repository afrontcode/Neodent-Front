import type { Id } from '@/lib/id'

export const ROLES = ['Odontólogo', 'Administrador', 'Paciente'] as const
export type Role = (typeof ROLES)[number]

/**
 * Roles del equipo del centro. La pantalla de Usuarios administra sólo a estas
 * personas; las cuentas de pacientes se crean desde el registro público.
 */
export const STAFF_ROLES = ['Odontólogo', 'Administrador'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export const ESPECIALIDADES = [
  'Ortodoncia', 'Endodoncia', 'Periodoncia', 'Prostodoncia',
  'Odontopediatría', 'Cirugía oral', 'Odontología general',
] as const

export interface User {
  id: Id
  nombre: string
  apellido: string
  correo: string
  /** Nivel de acceso a la aplicación. */
  rol: Role
  /** Especialidad clínica o cargo, según el rol. */
  esp: string
  activo: boolean
  /**
   * Si tiene disponibilidad configurada. Vendrá del endpoint de horarios;
   * mientras tanto se lee de los datos de ejemplo.
   */
  tieneHorario: boolean
  /**
   * Ficha de paciente asociada a la cuenta. Sólo la tienen las cuentas con rol
   * Paciente, y es la que enlaza al usuario con sus citas.
   */
  pacId?: Id
}

export type UserInput = Pick<User, 'nombre' | 'apellido' | 'correo' | 'rol' | 'esp' | 'activo'>
