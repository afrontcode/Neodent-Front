import type { Id } from '@/lib/id'

export const ROLES = ['Odontólogo', 'Administrador'] as const
export type Role = (typeof ROLES)[number]

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
}

export type UserInput = Pick<User, 'nombre' | 'apellido' | 'correo' | 'rol' | 'esp' | 'activo'>
