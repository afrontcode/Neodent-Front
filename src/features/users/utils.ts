import type { BadgeTone } from '@/components/ui'
import type { Role, User } from './types'

export const roleTone: Record<Role, BadgeTone> = {
  'Odontólogo': 'green',
  Administrador: 'blue',
  Paciente: 'gray',
}

export const isDentist = (u: Pick<User, 'rol'>) => u.rol === 'Odontólogo'

/** Cuenta de paciente: sólo ve sus propias citas, no el panel del centro. */
export const isPatient = (u: Pick<User, 'rol'>) => u.rol === 'Paciente'

/**
 * Un odontólogo sin disponibilidad configurada no puede recibir citas, así que
 * la tabla lo señala. A los administradores no les aplica.
 */
export const missingSchedule = (u: Pick<User, 'rol' | 'tieneHorario'>) =>
  isDentist(u) && !u.tieneHorario
